import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { degreeName, deptName } from '../../types.js'
import { AuthContext } from '../AuthContext.js'
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
  }, { message: 'Must be a in the format XX.XX' }),
  resume: z.instanceof(File).optional(),
})

export default function StudentOnboardingForm() {
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)
  if (!authContext || !authContext.user) {
    navigate('/app/login')
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!authContext?.user) {
      navigate('/app')
      return
    }
    console.log(values)
    // Send to server
    const res = await axios.post('/api/user/student', { name: authContext.user.user.name, kerberos: authContext.user.user.email.split('@')[0], ...values }, { headers: { 'Content-Type': 'application/json' } })
    if (res.status !== 200) {
      console.error('Failed to submit form') // TODO replace this with a toast
      return
    }
    await authContext?.reloadAuth()
    navigate('/app')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
        <FormField
          control={form.control}
          name="degree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Degree</FormLabel>
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
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                    Object.entries(deptName).map(([code, name]) =>
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

        <div className="grid grid-cols-12 gap-4">

          <div className="col-span-4">

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=""
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Your publicly visible description (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        </div>

        <FormField
          control={form.control}
          name="cgpa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CGPA</FormLabel>
              <FormControl>
                <Input
                  placeholder=""

                  type="text"
                  {...field}
                />
              </FormControl>
              <FormDescription>Your current CGPA</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
