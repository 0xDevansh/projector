'use client'

import type { ProjectDuration, ProjectType } from '../../types.js'
import {
  zodResolver,
} from '@hookform/resolvers/zod'
import {
  format,
} from 'date-fns'
import {
  Calendar as CalendarIcon,
} from 'lucide-react'
import React from 'react'
import {
  useForm,
} from 'react-hook-form'
import * as z from 'zod'
import { projectDuration, projectType } from '../../types.js'
import {
  cn,
} from '../utils.js'
import {
  Button,
} from './ui/button.js'
import {
  Calendar,
} from './ui/calendar.js'
import {
  Checkbox,
} from './ui/checkbox.js'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form.js'
import {
  Input,
} from './ui/input.js'
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from './ui/multi-select.js'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover.js'
import {
  Textarea,
} from './ui/textarea.js'

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  vacancy: z.coerce.number().min(1),
  projectType: z.array(z.string()),
  duration: z.array(z.string()),
  lastApplyDate: z.coerce.date(),
  minYear: z.number().min(1).optional(),
  minCgpa: z.string().optional(),
  eligibleDegrees: z.array(z.string()).optional(),
  eligibleDepartments: z.array(z.string()).optional(),
  prerequisites: z.string().optional(),
  selectionProcedure: z.string().optional(),
  learningOutcomes: z.string().optional(),
  stipendProvided: z.boolean(),
  stipendAmount: z.number().optional(),
}).superRefine(({ stipendProvided, stipendAmount, projectType, duration }, ctx) => {
  if (stipendProvided && !stipendAmount) {
    ctx.addIssue({
      message: 'Stipend amount must be greater than 0',
      path: ['stipendAmount'],
      code: 'custom',
    })
  }
  console.log(projectType, duration)
  if (!projectType.length) {
    ctx.addIssue({
      message: 'This field is required',
      path: ['projectType'],
      code: 'custom',
    })
  }
  if (!duration.length) {
    ctx.addIssue({
      message: 'This field is required',
      path: ['duration'],
      code: 'custom',
    })
  }
})

export default function MyForm() {
  const form = useForm < z.infer < typeof formSchema >> ({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectType: [],
      duration: [],
      eligibleDegrees: [],
      eligibleDepartments: [],
    },
  })

  function onSubmit(values: z.infer < typeof formSchema >) {
    try {
      console.log(values)
    }
    catch (error) {
      console.error('Form submission error', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Title"
                  type="text"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder=""
                  className="resize-none"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vacancy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vacancy</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormDescription>Number of students that will be selected (Optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-12 gap-4">

          <div className="col-span-6">

            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <FormControl>
                    <MultiSelector
                      values={field.value as any}
                      onValuesChange={field.onChange}
                      loop
                      className="max-w-xs"
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput placeholder="Select project type" />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          {
                            Object.keys(projectType).map(type => (
                              <MultiSelectorItem key={type} value={type}>{projectType[type as ProjectType]}</MultiSelectorItem>
                            ))
                          }
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </FormControl>
                  <FormDescription>The type of project</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration type</FormLabel>
                  <FormControl>
                    <MultiSelector
                      values={field.value as any}
                      onValuesChange={field.onChange}
                      loop
                      className="max-w-xs"
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput placeholder="Select languages" />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          {
                            Object.keys(projectDuration).map(duration => (
                              <MultiSelectorItem key={duration} value={duration}>{projectDuration[duration as ProjectDuration]}</MultiSelectorItem>
                            ))
                          }
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </FormControl>
                  <FormDescription>The duration type</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        </div>

        <FormField
          control={form.control}
          name="lastApplyDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Last application date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value
                        ? (
                            format(field.value, 'PPP')
                          )
                        : (
                            <span>Pick a date</span>
                          )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>The last date to apply for this project</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Year</FormLabel>
              <FormControl>
                <Input
                  placeholder=""

                  type="number"
                  {...field}
                />
              </FormControl>
              <FormDescription>The minimum year of study a student must be in to apply (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minCgpa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum CGPA</FormLabel>
              <FormControl>
                <Input
                  placeholder=""

                  type="text"
                  {...field}
                />
              </FormControl>
              <FormDescription>The minimum CGPA required to apply for this project (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-12 gap-4">

          <div className="col-span-6">

            <FormField
              control={form.control}
              name="eligibleDegrees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eligible Degrees</FormLabel>
                  <FormControl>
                    <MultiSelector
                      values={field.value as any}
                      onValuesChange={field.onChange}
                      loop
                      className="max-w-xs"
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput placeholder="Select languages" />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          <MultiSelectorItem value="React">React</MultiSelectorItem>
                          <MultiSelectorItem value="Vue">Vue</MultiSelectorItem>
                          <MultiSelectorItem value="Svelte">Svelte</MultiSelectorItem>
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </FormControl>
                  <FormDescription>The eligible degree students who can apply (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">

            <FormField
              control={form.control}
              name="eligibleDepartments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eligible Departments</FormLabel>
                  <FormControl>
                    <MultiSelector
                      values={field.value as any}
                      onValuesChange={field.onChange}
                      loop
                      className="max-w-xs"
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput placeholder="Select languages" />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          <MultiSelectorItem value="React">React</MultiSelectorItem>
                          <MultiSelectorItem value="Vue">Vue</MultiSelectorItem>
                          <MultiSelectorItem value="Svelte">Svelte</MultiSelectorItem>
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </FormControl>
                  <FormDescription>The departments eligible (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        </div>

        <FormField
          control={form.control}
          name="prerequisites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prerequisites </FormLabel>
              <FormControl>
                <Textarea
                  placeholder=""
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>The prerequisited for student selection (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="selectionProcedure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selection Procedure</FormLabel>
              <FormControl>
                <Textarea
                  placeholder=""
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>The procedure followed to select final students from the applicants (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="learningOutcomes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Learning Outcomes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder=""
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>What the students can expect to learn from this project (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stipendProvided"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value as any}
                  onCheckedChange={field.onChange}

                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Stipend Provided</FormLabel>

                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stipendAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stipend Amount (in ₹)</FormLabel>
              <FormControl>
                <Input
                  placeholder=""

                  type="number"
                  {...field}
                />
              </FormControl>
              <FormDescription>The amount of stipend provided (select No if none)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
