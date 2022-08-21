// Results from scans - TODO: ship from core.
export type Issues = {
  type: "error" | "warning" | "notice";
  code?: string;
  typeCode?: number;
  message?: string;
  context?: string;
  selector?: string;
  runner?: string;
};

export type IssuesInfo = {
  adaScoreAverage: number;
  possibleIssuesFixedByCdn: any;
  totalIssues: any;
  issuesFixedByCdn: any;
  errorCount: any;
  warningCount: any;
  noticeCount: any;
  pageCount: number;
};

export type Results = {
  domain: string;
  url: string;
  issues: Issues[];
  issuesInfo: IssuesInfo;
};
