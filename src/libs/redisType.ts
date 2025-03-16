/**
 * key 가장 앞 부분에 붙는 문자열이다.
 * ALL은 예외적으로 모든 key를 가져올 때 사용한다.
 *
 * SEPARATOR는 key를 구분하는 문자이다.
 */
export enum RedisType {
  All = '',
  SOCKET_CLIENTS = 'socket/clients',
  SEPARATOR = '/'
}
