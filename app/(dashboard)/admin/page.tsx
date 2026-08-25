"use client";
import RuleCard from "@/components/rule/RuleCard";
import { useRules } from "@/lib/hooks/rules";


export default function DetectionRules() {
    const { isPending, isError, data, error } = useRules({
      limit: 10,
      offset: 0,
    });

  return (
    <>
      <h1 className="text-3xl font-bold">Detection Rules</h1>
      <div className="flex gap-3 flex-wrap my-5">
            {data?.items.map((rule) => (
              <RuleCard key={rule.rule_id} rule={rule}/>
            ))}
      </div>
    </>
  );
}
