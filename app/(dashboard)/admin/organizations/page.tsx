"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrganizations } from "@/services/organizations/orgQueries";

export default function OrganizationsPage() {
  const { data, isPending, isError, refetch } = useOrganizations();
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Организации
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Список всех доступных организаций и их настроек
          </p>
        </div>
        <Link
          href="/admin/organizations/new"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
        >
          Добавить организацию
        </Link>
      </div>

      {isError ? (
        <div className="space-y-3 py-16 text-center">
          <p className="font-semibold text-[#1E2B6D]">
            Не удалось загрузить список организаций
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Название</TableHead>
                <TableHead className="w-[180px]">ID</TableHead>
                <TableHead>Псевдонимы</TableHead>
                <TableHead>Агенты</TableHead>
                <TableHead>Хосты</TableHead>
                <TableHead className="w-[120px]">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-gray-500"
                  >
                    Загрузка организаций...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-gray-500"
                  >
                    Организации не найдены
                  </TableCell>
                </TableRow>
              ) : (
                items.map((organization) => (
                  <TableRow key={organization.organization_id}>
                    <TableCell className="py-4 font-medium text-[#1E2B6D]">
                      <Link
                        href={`/admin/organizations/${encodeURIComponent(organization.organization_id)}`}
                        className="hover:underline"
                      >
                        {organization.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-600">
                      <Link
                        href={`/admin/organizations/${encodeURIComponent(organization.organization_id)}`}
                        className="hover:underline"
                      >
                        {organization.organization_id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {organization.aliases?.length ? (
                          organization.aliases.map((alias) => (
                            <Badge
                              key={alias}
                              variant="outline"
                              className="text-[11px]"
                            >
                              {alias}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {organization.agent_names?.length ? (
                          organization.agent_names.map((agent) => (
                            <Badge
                              key={agent}
                              variant="secondary"
                              className="text-[11px]"
                            >
                              {agent}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {organization.hostnames?.length ? (
                          organization.hostnames.map((hostname) => (
                            <Badge
                              key={hostname}
                              variant="outline"
                              className="text-[11px]"
                            >
                              {hostname}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          organization.enabled ? "default" : "destructive"
                        }
                        className="text-[11px]"
                      >
                        {organization.enabled ? "Активна" : "Отключена"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
