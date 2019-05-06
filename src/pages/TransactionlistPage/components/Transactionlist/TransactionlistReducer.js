/*
  Syntax and Convention Reference:
  https://github.com/erikras/ducks-modular-redux
  http://blog.jakoblind.no/reduce-redux-boilerplate/
*/

import { combineReducers } from 'redux';
import { interval, of } from 'rxjs';
import { mergeMap, mapTo, map, takeUntil, catchError, delay } from 'rxjs/operators';

import { combineEpics, ofType } from 'redux-observable';

import apiMongodb from 'services/api-mongodb';
import { errorLog } from 'helpers/error-logger';
import paramsToQuery from 'helpers/params-to-query';

// IMPORTANT
// Must modify action prefix since action types must be unique in the whole app
const actionPrefix = `TransactionlistPage/Transactionlist/`;

//Action Type
const FETCH_START = actionPrefix + `FETCH_START`;
const FETCH_FULFILLED = actionPrefix + `FETCH_FULFILLED`;
const FETCH_REJECTED = actionPrefix + `FETCH_REJECTED`;
const POLLING_START = actionPrefix + `POLLING_START`;
const POLLING_STOP = actionPrefix + `POLLING_STOP`;
const RECORDS_UPDATE = actionPrefix + `RECORDS_UPDATE`;

//Action Creator
export const fetchStart = () => ({ type: FETCH_START });
export const fetchFulfilled = payload => ({ type: FETCH_FULFILLED, payload });
export const fetchRejected = (payload, error) => ({ type: FETCH_REJECTED, payload, error });
export const pollingStart = () => ({ type: POLLING_START });
export const pollingStop = () => ({ type: POLLING_STOP });
export const recordsUpdate = (count) => ({ type: RECORDS_UPDATE, recordsCount: count });

//Epic
const startEpic = action$ => action$.pipe(
  ofType(POLLING_START),
  mapTo(fetchStart()),
);

const fetchEpic = (action$, state$) => action$.pipe(
  ofType(POLLING_START),
  mergeMap(action =>
    interval(500).pipe(
      mergeMap(action => {
        let { value: { transactionlistPage: { transactionlist: { records } }} } = state$;
        let params = { records_count: records };
        let query = paramsToQuery(params);

        return apiMongodb(`get_transactions${query}`).pipe(
          map(res => fetchFulfilled(res.response)),
          catchError(error => {
            errorLog("Transactions page/ get transaction list error",error);
            return of(fetchRejected(error.response, { status: error.status }))
          })
        )
      }),
      takeUntil(action$.pipe(
        ofType(POLLING_STOP, POLLING_START, FETCH_REJECTED)
      ))
    )
  ),
);

const recordsUpdateEpic = action$ => action$.pipe(
  ofType(RECORDS_UPDATE),
  mapTo(pollingStart()),
);

const repollEpic = action$ => action$.pipe(
  ofType(FETCH_REJECTED),
  delay(10000),
  mapTo(pollingStart()),
);

export const combinedEpic = combineEpics(
  startEpic,
  fetchEpic,
  repollEpic,
  recordsUpdateEpic
);


//Reducer
const dataInitState = {
  payload: [],
  error: undefined
}

const dataReducer = (state = dataInitState, action) => {
  switch (action.type) {
    case FETCH_START:
      return dataInitState;

    case FETCH_FULFILLED:
      return {
        ...state,
        payload: action.payload,
        error: undefined
      };

    case FETCH_REJECTED:
      return {
        ...state,
        payload: action.payload,
        error: action.error
      };

    case RECORDS_UPDATE:
      return {
        ...state
      };

    default:
      return state;
  }
};

const isFetchingReducer = (state = false, action) => {
  switch (action.type) {
    case FETCH_START:
      return true;

    case FETCH_FULFILLED:
    case FETCH_REJECTED:
      return false;

    default:
      return state;
  }
};

const recordsReducer = (state = 100, action) => {
  switch (action.type) {
    case RECORDS_UPDATE:
      return action.recordsCount;

    default:
      return state;
  }
};


export const combinedReducer = combineReducers({
  data: dataReducer,
  isFetching: isFetchingReducer,
  records: recordsReducer
})