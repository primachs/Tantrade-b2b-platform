import type { ComponentType } from "react";

type IconProps = { className?: string };

export type IconType = ComponentType<IconProps>;

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type EndpointGroup = "auth" | "governance" | "taxonomy" | "matching";

export type ParamDef = {
  key: string;
  label: string;
  placeholder: string;
};

export type Endpoint = {
  id: string;
  group: EndpointGroup;
  title: string;
  summary: string;
  method: HttpMethod;
  path: string;
  requiresAuth?: boolean;
  bodyTemplate?: string;
  pathParams?: ParamDef[];
  queryParams?: ParamDef[];
};

export type ResponseState = {
  ok: boolean;
  status: number;
  url: string;
  method: HttpMethod;
  durationMs: number;
  body: unknown;
  error?: string;
};

export type GroupMeta = {
  id: EndpointGroup;
  title: string;
  description: string;
  icon: IconType;
};
