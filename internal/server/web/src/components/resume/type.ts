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

export interface Resume {
  profile: Profile;
  skills: string[];
  education: Education[];
  workExperiences: Array<WorkExperience>;
}

export interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  dateFrom: string;
  dateTo?: string;
}

export interface Links {
  name: string;
  key?: string;
  link: string;
}

export interface Profile {
  name: string;
  email: string;
  links: Links[];
  phone: string;
  website: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  location: string;
  dateFrom: string;
  dateTo?: string;
  responsibilities: string[];
}
