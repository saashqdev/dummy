export type IServerComponentsProps = {
  params?: Promise<{ [key: string]: string }>
  searchParams?: Promise<ISearchParams>
}

export type ISearchParams = {
  [key: string]: string | string[] | undefined
}

export interface IServerAction {
  actionData: any
  action: (form: FormData) => void
  pending: boolean
}
