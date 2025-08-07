export type PaginationDto = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  sortedBy?: SortedByDto[]
  query?: string | undefined
}

export type PaginationRequestDto = {
  page: number
  pageSize: number
  sortedBy?: SortedByDto[]
}

export type SortedByDto = {
  name: string
  direction: 'asc' | 'desc'
}
