export type PaginationDto = {
  page: number
  page_size: number
  totalItems: number
  totalPages: number
  sortedBy?: SortedByDto[]
  query?: string | undefined
}

export type PaginationRequestDto = {
  page: number
  page_size: number
  sortedBy?: SortedByDto[]
}

export type SortedByDto = {
  name: string
  direction: 'asc' | 'desc'
}
