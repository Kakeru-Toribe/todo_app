import { RESOURCES } from './resources';

const JSON_HEADER = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

interface Resource {
  [key: string]: string;
}

interface Params {
  [key: string]: any;
}

/**
 * pathを組み立てる
 *
 * 動的な部分(/:id 等)をparamsの値で置き換える
 * ptah内のsymbolとparamsのkeyが同名である必要がある
 *
 * @param{Resource} resource
 * @param{Params} params
 * @return {string}
 */
const buildPath = function(resource: Resource, params: Params): string {
  let path = resource[params.action];

  Object.keys(params).forEach(key => {
    path = path.replace(`:${key}`, params[key]);
  });

  return path;
};

/**
 * pathにクエリパラメータを結合
 *
 * @param{string} path
 * @param{Params} queryParams
 * @return {string}
 */
const withQuery = function(path: string, queryParams: Params): string {
  if (!queryParams) return path;

  const urlParams = new URLSearchParams(Object.entries(queryParams));
  return path + '?' + urlParams;
};

// リクエスト中のXHRをキャンセルするためのコントローラー
const abortController = new AbortController();

/**
 * リクエスト時に利用するエラーオブジェクト。
 * リクエストエラーが発生した時に例外として上げて reject で伝播する仕組み。
 **/
class ResponseError extends Error {
  path: string;
  status: number;
  params: Params;

  /**
   * @param {string} msg - エラーメッセージ
   * @param {string} path - リクエストパス
   * @param {Number} status - HTTP ステータス
   * @param {Object} params - リクエストパラメーター
   **/
  constructor(msg: string, path: string, status: number, params: Params) {
    super(msg);
    this.path = path;
    this.status = status;
    this.params = params;
  }
}

/**
 * API Gateway
 *
 */
export default class Gateway {
  resource: string;
  requestParams: Params | null;
  responseHandlers: { [key: number]: Function; other: Function };

  /**
   * params {string} resource: リソース名
   */
  constructor(resource: string) {
    if (!RESOURCES[resource]) throw new Error('Resource not found');

    this.resource = resource;
    this.requestParams = null;

    // NOTE: abortするとそれ以降のリクエストが全て殺されて画面が動かなくなるので、一旦コメントアウトする
    // NOTE: 必要性が生じたときに復活させる
    this.responseHandlers = {
      200: (response: Response) => {
        return response.json().then(body => ({ status: response.status, body: body }));
      },

      401: (response: Response) => {
        abortController.abort();
        alert('認証の有効期限が切れました。ページを再読込します。');
        window.document.location.reload();
        return response.json().then(body => ({ status: response.status, body: body }));
      },

      403: () => {
        abortController.abort();
        window.document.location.href = '/platform/errors/forbidden';
      },

      404: (response: Response) => {
        return response.json().then(body => ({ status: response.status, body: body }));
      },

      422: (response: Response) => {
        return response.json().then(body => ({ status: response.status, body: body }));
      },

      other: (response: Response, path: string, params: Params) => {
        // abortController.abort();
        throw new ResponseError('Something went wrong', path, response.status, params);
      }
    };
  }

  response(response: Response, path: string, params: Params, responseHandlers: { [key: number]: Function; other?: Function } = {}) {
    const status = response.status;
    return (
      responseHandlers[status] ||
      this.responseHandlers[status] ||
      responseHandlers.other ||
      this.responseHandlers.other
    )(response, path, params);
  }

  get(params: Params, requestParams: Params | null = null, responseHandlers: { [key: number]: Function; other?: Function } = {}) {
    if (!RESOURCES[this.resource][params.action]) throw new Error('No Actions found');

    let path = buildPath(RESOURCES[this.resource], params);
    if (requestParams) {
      path = withQuery(path, requestParams);
    }

    return fetch(path, { signal: abortController.signal }).then(result => {
      return this.response(result, path, params, responseHandlers);
    });
  }

  post(params: Params, requestParams: Params | null = null, responseHandlers: { [key: number]: Function; other?: Function } = {}) {
    if (!RESOURCES[this.resource][params.action]) throw new Error('No Actions found');

    let path = buildPath(RESOURCES[this.resource], params);

    return fetch(path, {
      method: 'POST',
      headers: JSON_HEADER,
      body: JSON.stringify(requestParams),
      signal: abortController.signal
    }).then(result => {
      return this.response(result, path, params, responseHandlers);
    });
  }

  put(params: Params, requestParams: Params | null = null, responseHandlers: { [key: number]: Function; other?: Function } = {}) {
    if (!RESOURCES[this.resource][params.action]) throw new Error('No Actions found');

    let path = buildPath(RESOURCES[this.resource], params);

    return fetch(path, {
      method: 'PUT',
      headers: JSON_HEADER,
      body: JSON.stringify(requestParams),
      signal: abortController.signal
    }).then(result => {
      return this.response(result, path, params, responseHandlers);
    });
  }

  delete(params: Params, requestParams: Params | null = null, responseHandlers: { [key: number]: Function; other?: Function } = {}) {
    if (!RESOURCES[this.resource][params.action]) throw new Error('No Actions found');

    let path = buildPath(RESOURCES[this.resource], params);

    return fetch(path, {
      method: 'DELETE',
      headers: JSON_HEADER,
      body: JSON.stringify(requestParams),
      signal: abortController.signal
    }).then(result => {
      return this.response(result, path, params, responseHandlers);
    });
  }
}