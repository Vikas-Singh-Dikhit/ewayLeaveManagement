import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LeaveType, DayType, LEAVE_TYPE_LABELS } from '@/types/leave';
import { useLeave } from '@/contexts/LeaveContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, Upload, Sun, Moon, Calendar as CalendarIconFull } from 'lucide-react';
import { format, differenceInDays, addDays, eachDayOfInterval } from 'date-fns';

type DateDayType = 'full' | 'first_half' | 'second_half';

interface DateBreakdown {
  date: Date;
  dayType: DateDayType;
}

const leaveFormSchema = z.object({
  leaveType: z.enum(['casual', 'sick', 'earned', 'wfh', 'comp_off']),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  reason: z.string().min(10, 'Please provide a reason (min 10 characters)').max(500),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

type LeaveFormData = z.infer<typeof leaveFormSchema>;

interface LeaveApplicationFormProps {
  onSuccess?: () => void;
}

export const LeaveApplicationForm: React.FC<LeaveApplicationFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { applyLeave, leaveBalance } = useLeave();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateBreakdown, setDateBreakdown] = useState<DateBreakdown[]>([]);

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leaveType: 'casual',
      reason: '',
    },
  });

  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  // Generate date breakdown when dates change
  useMemo(() => {
    if (startDate && endDate && endDate >= startDate) {
      const dates = eachDayOfInterval({ start: startDate, end: endDate });
      const newBreakdown = dates.map(date => ({
        date,
        dayType: 'full' as DateDayType,
      }));
      setDateBreakdown(newBreakdown);
    } else {
      setDateBreakdown([]);
    }
  }, [startDate, endDate]);

  const updateDateType = (index: number, dayType: DateDayType) => {
    setDateBreakdown(prev => 
      prev.map((item, i) => i === index ? { ...item, dayType } : item)
    );
  };

  const calculateTotalDays = useMemo(() => {
    return dateBreakdown.reduce((total, item) => {
      return total + (item.dayType === 'full' ? 1 : 0.5);
    }, 0);
  }, [dateBreakdown]);

  const onSubmit = async (data: LeaveFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Determine overall dayType based on breakdown
      const hasHalfDays = dateBreakdown.some(d => d.dayType !== 'full');
      const overallDayType: DayType = hasHalfDays ? 'first_half' : 'full'; // Simplified for API
      
      applyLeave({
        employeeId: user.id,
        employeeName: user.name,
        department: user.department,
        leaveType: data.leaveType as LeaveType,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        dayType: overallDayType,
        reason: data.reason,
        daysCount: calculateTotalDays,
      });

      toast({
        title: 'Leave Applied',
        description: `Your leave request for ${calculateTotalDays} day(s) has been submitted for approval.`,
      });

      form.reset();
      setDateBreakdown([]);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit leave request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Apply for Leave</CardTitle>
        <CardDescription>Fill in the details below to submit your leave request</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Leave Type */}
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center justify-between w-full">
                            <span>{LEAVE_TYPE_LABELS[type]}</span>
                            <span className="text-muted-foreground ml-4">
                              ({leaveBalance[type]} available)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date() || (form.getValues('startDate') && date < form.getValues('startDate'))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Breakdown */}
            {dateBreakdown.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Day-wise Selection</Label>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
                    <span>Date</span>
                    <span className="text-center">Full Day</span>
                    <span className="text-center">First Half</span>
                    <span className="text-center">Second Half</span>
                  </div>
                  <div className="divide-y divide-border max-h-64 overflow-y-auto">
                    {dateBreakdown.map((item, index) => (
                      <div 
                        key={item.date.toISOString()} 
                        className="px-4 py-3 grid grid-cols-4 gap-2 items-center hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIconFull className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {format(item.date, 'EEE, MMM d')}
                          </span>
                        </div>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => updateDateType(index, 'full')}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              item.dayType === 'full' 
                                ? "bg-primary text-primary-foreground shadow-md" 
                                : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            )}
                            title="Full Day"
                          >
                            <div className="w-3 h-3 rounded-full bg-current" />
                          </button>
                        </div>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => updateDateType(index, 'first_half')}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              item.dayType === 'first_half' 
                                ? "bg-primary text-primary-foreground shadow-md" 
                                : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            )}
                            title="First Half (Morning)"
                          >
                            <Sun className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => updateDateType(index, 'second_half')}
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                              item.dayType === 'second_half' 
                                ? "bg-primary text-primary-foreground shadow-md" 
                                : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            )}
                            title="Second Half (Afternoon)"
                          >
                            <Moon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Days Summary */}
            {calculateTotalDays > 0 && (
              <div className="p-4 bg-accent rounded-lg flex items-center justify-between">
                <p className="text-sm font-medium">
                  Total Leave Days: <span className="text-primary font-bold text-lg">{calculateTotalDays}</span>
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    Full: {dateBreakdown.filter(d => d.dayType === 'full').length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sun className="w-3 h-3" />
                    First: {dateBreakdown.filter(d => d.dayType === 'first_half').length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Moon className="w-3 h-3" />
                    Second: {dateBreakdown.filter(d => d.dayType === 'second_half').length}
                  </span>
                </div>
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a reason for your leave request..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Upload (Optional) */}
            <div className="space-y-2">
              <Label>Supporting Document (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG up to 10MB
                </p>
                <Input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { form.reset(); setDateBreakdown([]); }}>
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
