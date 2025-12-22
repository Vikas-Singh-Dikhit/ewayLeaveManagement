import React, { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, Upload } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const leaveFormSchema = z.object({
  leaveType: z.enum(['casual', 'sick', 'earned', 'wfh', 'comp_off']),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  dayType: z.enum(['full', 'first_half', 'second_half']),
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

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leaveType: 'casual',
      dayType: 'full',
      reason: '',
    },
  });

  const watchedDates = form.watch(['startDate', 'endDate', 'dayType']);
  const calculateDays = () => {
    const [startDate, endDate, dayType] = watchedDates;
    if (!startDate || !endDate) return 0;
    const days = differenceInDays(endDate, startDate) + 1;
    return dayType === 'full' ? days : days * 0.5;
  };

  const onSubmit = async (data: LeaveFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const daysCount = calculateDays();
      
      applyLeave({
        employeeId: user.id,
        employeeName: user.name,
        department: user.department,
        leaveType: data.leaveType as LeaveType,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        dayType: data.dayType as DayType,
        reason: data.reason,
        daysCount,
      });

      toast({
        title: 'Leave Applied',
        description: `Your leave request for ${daysCount} day(s) has been submitted for approval.`,
      });

      form.reset();
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Day Type */}
            <FormField
              control={form.control}
              name="dayType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full" id="full" />
                        <Label htmlFor="full">Full Day</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="first_half" id="first_half" />
                        <Label htmlFor="first_half">First Half</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="second_half" id="second_half" />
                        <Label htmlFor="second_half">Second Half</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Days Summary */}
            {calculateDays() > 0 && (
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm font-medium">
                  Total Leave Days: <span className="text-primary font-bold">{calculateDays()}</span>
                </p>
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
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
