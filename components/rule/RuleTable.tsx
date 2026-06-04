"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRules } from "@/lib/hooks/rules";
import { RuleType } from "@/types";


export default function RuleTable() {
  const { isPending, isError, data, error } = useRules({
    limit: 10,
    offset: 0,
  });

  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

  return (
    <>
      {data?.items.map((rule, index) => (
        <div
          key={index}
          className="mx-4 my-6 rounded-2xl border shadow-sm overflow-hidden max-w-2xl"
        >
          <div className="px-6 py-4 bg-muted/50 border-b">
            <h2 className="text-lg font-semibold">{rule.rule_id}</h2>
            <p className="text-sm text-muted-foreground">{rule.description}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px] bg-muted/30">Поле</TableHead>
                <TableHead className="bg-muted/30">Значение</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Object.keys(rule) as string[]).map((key, i) => (
                <TableRow key={i} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-muted-foreground text-sm">
                    {key}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div
                      className="overflow-hidden text-ellipsis whitespace-nowrap"
                      title={formatValue(rule[key as keyof RuleType])}
                    >
                      {formatValue(rule[key as keyof RuleType])}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </>
  );
}
