'use client'

import type { Project } from '../../models/ProfessorProject.js'
import type { AuthCtx } from '../AuthContext.js'
import {
  zodResolver,
} from '@hookform/resolvers/zod'
import axios from 'axios'

import React from 'react'
import {
  useForm,
} from 'react-hook-form'
import * as z from 'zod'
import {
  Button,
} from './ui/button.js'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form.js'
import {
  Textarea,
} from './ui/textarea.js'

const formSchema = z.object({
  relevantSkills: z.string(),
  statementOfPurpose: z.string(),
})

export default function ProjectApplicationForm({ project, authCtx }: { project: Project, authCtx: AuthCtx | undefined }) {
  const form = useForm < z.infer < typeof formSchema >> ({
    resolver: zodResolver(formSchema),
  })

  const kerberos = authCtx?.user?.user.kerberos
  if (!kerberos) {
    return <p>Not logged in</p>
  }
  async function onSubmit(values: z.infer < typeof formSchema >) {
    try {
      const res = await axios.post(`/api/project/${project.id}/applications`, { ...values, projectId: project.id, studentKerberos: authCtx?.user?.user.kerberos })
      console.log(res.data)
    }
    catch (error) {
      console.error('Form submission error', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-3xl mx-auto py-1">

        <FormField
          control={form.control}
          name="relevantSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relevant Skills</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Do you have any skills and/or experience relevant to this project?"
                  className="resize-y"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="statementOfPurpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statement of Purpose</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Why are you the best candidate for this project?"
                  className="resize-y"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
