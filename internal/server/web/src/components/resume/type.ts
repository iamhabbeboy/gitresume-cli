export interface Dataprop {
  name: string;
  slug?: string;
  values: ValueProps[];
}

export interface ValueProps {
  value: string;
  url?: string;
  data?: string;
}

export interface TableProps {
  data: Dataprop[];
}

export interface Resume {
  id?: number;
  user_id?: number;
  version?: number;
  title?: string;
  is_published?: boolean;
  profile: Profile;
  skills: string[];
  education: Education[];
  work_experiences: WorkExperience[];
}

export interface Education {
  id?: number;
  school: string;
  degree: string;
  field_of_study: string;
  end_date?: string;
}

export interface Links {
  name: string;
  key?: string;
  link: string;
}

export interface Profile {
  name: string;
  email: string;
  links: string[];
  phone: string;
  professional_summary: string;
  location: string;
  website: string;
}

export interface WorkExperience {
  id?: number;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  projects: string[];
  responsibilities: string;
}

export interface OptionType {
  label: string;
  value: number;
}

export interface ReOrder {
  label: string;
  component: React.ReactNode;
}
