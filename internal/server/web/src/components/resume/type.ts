export interface Dataprop {
  name: string;
  slug?: string;
  values: ValueProps[];
}

export interface ValueProps {
  value: string;
  url?: string;
}

export interface TableProps {
  data: Dataprop[];
}
