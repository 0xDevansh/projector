import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '../hooks/use-toast.js'
import { Button } from './ui/button.js'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form.js'
import { RadioGroup, RadioGroupItem } from './ui/radio-group.js'
import { Textarea } from './ui/textarea.js'

const contactFormSchema = z.object({
  type: z.enum(['bug', 'feature', 'other']),
  message: z.string(),
})

export default function SupportForm() {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      type: 'bug',
    },
  })

  async function onSubmit(values: z.infer<typeof contactFormSchema>) {
    try {
      await axios.post('/api/support-message', values)
      toast({ title: 'Query has been sent' })
      form.reset({ message: '', type: 'bug' })
    }
    catch (err: any) {
      console.error(err)
      toast({ title: 'Error!', description: err.message || undefined })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="space-y-[2px]">
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Your message
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type of enquiry</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {[['bug', 'Bug report'], ['feature', 'Feature request'], ['other', 'Other']].map(enquiryType => (
                    <FormItem className="flex items-center space-x-3 space-y-0" key={enquiryType[0]}>
                      <FormControl>
                        <RadioGroupItem value={enquiryType[0]} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {enquiryType[1]}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
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
