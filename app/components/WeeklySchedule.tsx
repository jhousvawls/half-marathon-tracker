import { DaySchedule } from "@/lib/planning";
import { cn } from "@/lib/utils";
import { Check, Circle, X } from "lucide-react";
import { format, parseISO } from "date-fns";

interface WeeklyScheduleProps {
    schedule: DaySchedule[];
}

export function WeeklySchedule({ schedule }: WeeklyScheduleProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">This Week's Schedule</h3>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Week {schedule[0]?.weekNumber || 1}</span>
            </div>
            <div className="divide-y divide-gray-100">
                {schedule.map((day) => {
                    // completion logic: verify if any core activity was marked done
                    const log = day.log;
                    const isDone = log?.completed_run || log?.completed_otf || log?.completed_walk || log?.completed_mobility;
                    // If past and not done, it's missed. If today, it's in progress/pending.
                    const isMissed = day.isPast && !isDone && !day.isRestDay;

                    return (
                        <div key={day.date} className={cn(
                            "flex items-center p-3 transition-colors",
                            day.isToday ? "bg-blue-50/50" : "hover:bg-gray-50"
                        )}>
                            {/* Date Column */}
                            <div className="w-16 flex-shrink-0">
                                <div className={cn("text-sm font-bold", day.isToday ? "text-blue-600" : "text-gray-700")}>
                                    {format(parseISO(day.date), 'EEE')}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {format(parseISO(day.date), 'd')}
                                </div>
                            </div>

                            {/* Activity Column */}
                            <div className="flex-grow min-w-0 px-2">
                                <div className={cn("text-sm font-medium truncate", isMissed ? "text-gray-400 line-through" : "text-gray-900")}>
                                    {day.workoutLabel}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {day.target || (day.isRestDay ? "Recovery" : "Standard session")}
                                </div>
                            </div>

                            {/* Status Icon */}
                            <div className="flex-shrink-0 w-8 flex justify-center">
                                {isDone ? (
                                    <div className="text-green-500 bg-green-100 p-1 rounded-full">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                ) : isMissed ? (
                                    <div className="text-red-300 bg-red-50 p-1 rounded-full">
                                        <X size={14} />
                                    </div>
                                ) : day.isRestDay ? (
                                    <div className="text-gray-300">
                                        <Circle size={14} className="opacity-20" />
                                    </div>
                                ) : (
                                    <div className="text-gray-300 border-2 border-gray-200 rounded-full w-5 h-5" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
