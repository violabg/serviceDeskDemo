export const CUSTOMER_EDIT_PARAM = "edit"

const CUSTOMER_EDIT_VALUE = "true"

export function isCustomerEditState(searchParams: URLSearchParams): boolean {
  return searchParams.get(CUSTOMER_EDIT_PARAM) === CUSTOMER_EDIT_VALUE
}

export function customerPathForState(basePath: string, editing: boolean): string {
  if (basePath.includes("?")) {
    throw new TypeError(`customerPathForState expects a base path without a query: ${basePath}`)
  }
  return editing ? `${basePath}?${CUSTOMER_EDIT_PARAM}=${CUSTOMER_EDIT_VALUE}` : basePath
}
