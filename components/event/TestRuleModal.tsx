import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner"; 
import { useAdminTestRule } from "@/services/rules/adminRules/ruleQueries";
import type { RuleCreateUpdateType } from "@/types/rules";
import type { NewEventType } from "@/types/events"; // импортируем ваш созданнный TS тип

interface Props {
  new_rule: RuleCreateUpdateType;
  isOpen: boolean;
  onClose: () => void;
}

const defaultEventValues: NewEventType = {
  timestamp: new Date().toISOString(),
  timestamp_raw: "",
  source_ip: "",
  source_user: "",
  source_host: "",
  destination_ip: "",
  destination_host: "",
  dst_port: 0,
  observer_host: "",
  rule_id: "",
  rule_level: 0,
  rule_name: "",
  rule_groups: [],
  mitre_ids: [],
  mitre_tactics: [],
  mitre_techniques: [],
  event_type: "unknown",
  action: "",
  outcome: "",
  detection_rule_id: "",
  detection_rule_description: "",
  detection_category: "",
  detection_confidence: 0,
  severity_hint: "",
  attack_type: "",
  scenario_type: "",
  explanation_template: "",
  recommendations: [],
  log_source_type: "",
  szi_source: "",
  product_name: "",
  vendor_name: "",
  request_uri: "",
  url: "",
  http_method: "",
  http_status: 200,
  user_agent: "",
  referrer: "",
  payloads: [],
  payload_type: "",
  payload_indicators: [],
  signature: "",
  signature_id: "",
  attack_name: "",
  event_code: "",
  winlog_channel: "",
  computer_name: "",
  process_name: "",
  process_path: "",
  process_command_line: "",
  process_pid: "",
  parent_process_name: "",
  parent_process_path: "",
  parent_process_command_line: "",
  parent_process_pid: "",
  target_user: "",
  logon_type: "",
  logon_id: "",
  file_path: "",
  file_hash: "",
  md5_hash: "",
  sha1_hash: "",
  sha256_hash: "",
  registry_key: "",
  service_name: "",
  task_name: "",
  raw: {},
};

export default function TestRuleModal({ new_rule, isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<
    "general" | "network" | "process" | "http"
  >("general");
  const { mutate: testRule, isPending } = useAdminTestRule();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewEventType>({
    defaultValues: defaultEventValues,
  });

  if (!isOpen) return null;

  const onSubmit = (eventData: NewEventType) => {
    testRule(
      { rule: new_rule, event: eventData },
      {
        onSuccess: (data) => {
          toast.success("Правило успешно протестировано!");
          onClose();
        },
        onError: (error) => {
          toast.error("Ошибка при тестировании правила");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold">Тестирование правила</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Навигация по секциям формы */}
        <div className="my-4 flex gap-2 border-b text-sm">
          {(["general", "network", "process", "http"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-3 capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 font-bold text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {tab === "general" && "Общие"}
              {tab === "network" && "Сеть"}
              {tab === "process" && "Процессы"}
              {tab === "http" && "HTTP"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {/* Секция: Общие данные */}
            {activeTab === "general" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold">
                    Timestamp *
                  </label>
                  <input
                    {...register("timestamp", { required: "Заполните время" })}
                    className="w-full rounded border p-2 text-sm"
                  />
                  {errors.timestamp && (
                    <p className="text-xs text-red-500">
                      {errors.timestamp.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold">
                    Event Type
                  </label>
                  <input
                    {...register("event_type")}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">Action</label>
                  <input
                    {...register("action")}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">Outcome</label>
                  <input
                    {...register("outcome")}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Секция: Сеть */}
            {activeTab === "network" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold">
                    Source IP
                  </label>
                  <input
                    {...register("source_ip")}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">
                    Destination IP
                  </label>
                  <input
                    {...register("destination_ip")}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">
                    Destination Port
                  </label>
                  <input
                    type="number"
                    {...register("dst_port", { valueAsNumber: true })}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">
                    Source Host
                  </label>
                  <input
                    {...register("source_host")}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Секция: Процессы */}
            {activeTab === "process" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold">
                    Process Name
                  </label>
                  <input
                    {...register("process_name")}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">
                    Process Path
                  </label>
                  <input
                    {...register("process_path")}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold">
                    Process Command Line
                  </label>
                  <input
                    {...register("process_command_line")}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Секция: HTTP */}
            {activeTab === "http" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold">
                    HTTP Method
                  </label>
                  <input
                    {...register("http_method")}
                    className="w-full rounded border p-2 text-sm"
                    placeholder="GET, POST..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold">
                    HTTP Status
                  </label>
                  <input
                    type="number"
                    {...register("http_status", { valueAsNumber: true })}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold">URL</label>
                  <input
                    {...register("url")}
                    className="w-full rounded border p-2 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Тестирование..." : "Запустить тест"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
