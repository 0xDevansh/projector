import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import React, { useContext, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { centreNames, degreeName, deptNames, schoolNames } from '../../types.js'

import { AuthContext } from '../AuthContext.js'
import { useToast } from '../hooks/use-toast.js'
import { loginLink } from '../layouts/Header.js'
import { Button } from './ui/button.js'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form.js'
import { Input } from './ui/input.js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.js'
import { Textarea } from './ui/textarea.js'

const formSchema = z.object({
  department: z.string(),
  bio: z.string().optional(),
  degree: z.string(),
  cgpa: z.string().refine((v) => {
    return !Number.isNaN(Number.parseFloat(v)) && v.includes('.') && v.split('.')[1].length === 2
  }, { message: 'Must have 2 decimal places' }),
  resume: z.instanceof(FileList).optional().refine((fileList) => {
    if (!fileList || fileList.length === 0)
      return true
    return fileList.length === 1
  }, { message: 'Only one file is allowed' }).refine((fileList) => {
    if (!fileList || fileList.length === 0)
      return true
    return fileList[0].type === 'application/pdf'
  }, { message: 'Only PDF files are allowed' }).refine((fileList) => {
    if (!fileList || fileList.length === 0)
      return true
    return fileList[0].size <= 1024 * 1024 * 3
  }, { message: 'File is larger than 2mb' }),
})

export default function StudentOnboardingForm() {
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)
  const { toast } = useToast()
  useEffect(() => {
    if (!authContext || !authContext.user) {
      navigate(loginLink)
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  const fileRef = form.register('resume')
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!authContext?.user) {
      navigate('/app')
      return
    }
    // Send to server
    const mainRes = await axios.post('/api/user/student', { ...values, name: authContext.user.user.name, kerberos: authContext.user.user.email.split('@')[0], resume: undefined }, { headers: { 'content-type': 'application/json' } })
    if (mainRes.status !== 200) {
      console.error('Failed to submit form')
      toast({ title: 'Failed to submit form', variant: 'destructive' })
      return
    }
    await authContext?.reloadAuth()
    if (values.resume?.length) {
      const formData = new FormData()
      formData.append('resume', values.resume[0], `${authContext?.user?.user.kerberos}.pdf`)

      // const resumeRes = await axios.post('/api/user/resume', formData, { headers: { 'content-type': 'multipart/form-data' } })
      const resumeRes = await fetch('/api/user/resume', { method: 'POST', body: formData })
      if (resumeRes.status !== 200) {
        console.error('Failed to upload resume')
        toast({ title: 'Failed to submit form', variant: 'destructive' })
        return
      }
    }
    navigate('/app')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto py-5">
        <FormField
          control={form.control}
          name="degree"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Degree</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                    Object.entries(degreeName).map(([code, name]) =>
                      <SelectItem key={code} value={code}>{name}</SelectItem>,
                    )
                  }
                </SelectContent>
              </Select>
              <FormDescription>The degree you are currently persuing</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <span className="font-semibold">Department</span>
                  {
                    Object.entries(deptNames).map(([code, name]) =>
                      <SelectItem key={code} value={code}>{name || 'Unknown'}</SelectItem>,
                    )
                  }
                  <span className="font-semibold">Centre</span>
                  {
                    Object.entries(centreNames).map(([code, name]) =>
                      <SelectItem key={code} value={code}>{name || 'Unknown'}</SelectItem>,
                    )
                  }
                  <span className="font-semibold">School</span>
                  {
                    Object.entries(schoolNames).map(([code, name]) =>
                      <SelectItem key={code} value={code}>{name || 'Unknown'}</SelectItem>,
                    )
                  }
                </SelectContent>
              </Select>
              <FormDescription>Your current department</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cgpa"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>CGPA</FormLabel>
              <FormControl>
                <Input
                  placeholder=""

                  type="text"
                  {...field}
                />
              </FormControl>
              <FormDescription>Your current CGPA (upto 2 decimal places)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder=""
                  {...field}
                />
              </FormControl>
              <FormDescription>Your publicly visible description (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resume"
          render={() => {
            return (
              <FormItem>
                <FormLabel>Resume</FormLabel>
                <FormControl>
                  <Input type="file" placeholder="shadcn" {...fileRef} />
                </FormControl>
                <FormDescription>Upload a PDF, up to 2mb</FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>

  )
}
