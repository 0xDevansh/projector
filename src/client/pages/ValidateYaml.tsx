import {
  zodResolver,
} from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { parse } from 'yaml'
import { z } from 'zod'
import { Alert, AlertDescription } from '../components/ui/alert.js'
import { Button } from '../components/ui/button.js'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form.js'
import { Input } from '../components/ui/input.js'

// Define enums for constrained values
const ProjectType = z.enum([
  'disa', // Design and Innovation Summer Award
  'sura', // Summer Undergraduate Research Award
  'btp', // BTech project
  'mtp', // MTech project
  'design',
  'major',
  'minor',
])

const Duration = z.enum([
  'summer',
  'winter',
  'semester',
  'year',
  'short', // short term
  'long', // long term
  'other',
])

const EligibleDegree = z.enum([
  'btech',
  'mtech',
  'dual',
  'phd',
  'msc',
  'msr',
  'bdes',
  'mdes',
])

const EligibleDepartment = z.enum([
  'am',
  'beb',
  'chemical',
  'chemistry',
  'civil',
  'cse',
  'design',
  'ee',
  'dese',
  'hss',
  'mse',
  'maths',
  'mech',
  'physics',
  'textile',
])

// Main project template schema
export const ProjectTemplateSchema = z.object({
  // === BASIC DETAILS ===
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  prerequisites: z.string().optional(),
  learningOutcomes: z.string().optional(),
  selectionProcedure: z.string().optional(),
  projectType: z.array(ProjectType).min(1, 'At least one project type is required'),
  duration: z.array(Duration).min(1, 'At least one duration is required'),
  lastApplyDate: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Date must be in YYYY-MM-DD format',
  ).refine((date) => {
    const parsedDate = new Date(date)
    return !Number.isNaN(parsedDate.getTime())
  }, 'Invalid date'),
  vacancy: z.number().int().positive('Vacancy must be a positive integer'),

  // === ELIGIBILITY CRITERIA ===
  minCgpa: z.string().regex(
    /^\d+\.\d{2}$/,
    'CGPA must have exactly 2 decimal places',
  ).optional(),
  eligibleDegrees: z.array(EligibleDegree).optional(),
  eligibleDepartments: z.array(EligibleDepartment).optional(),
  minYear: z.number().int().min(1).max(10).optional(),
  stipendProvided: z.boolean().optional().default(false),
  stipendAmount: z.number().min(0).optional().default(0),
}).superRefine(({ stipendProvided, stipendAmount }, ctx) => {
  if (stipendProvided && (!stipendAmount || stipendAmount <= 0)) {
    ctx.addIssue({
      message: 'Stipend amount must be greater than 0 when stipend is provided',
      path: ['stipendAmount'],
      code: 'custom',
    })
  }
})

// Export individual enums for use elsewhere if needed
export { Duration, EligibleDegree, EligibleDepartment, ProjectType }

const formSchema = z.object({
  yamlFile: z.any().refine((files) => {
    return files?.[0]
  }, 'A YAML file is required'),
})

export default function ValidateYaml() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const [validationResult, setValidationResult] = useState<{
    success: boolean
    message: string
    errors?: string[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateYamlFile = async (file: File): Promise<{ isValid: boolean, error?: string }> => {
    if (!file) {
      return { isValid: false, error: 'Please select a file' }
    }

    const fileName = file.name.toLowerCase()
    const isYamlFile = fileName.endsWith('.yaml') || fileName.endsWith('.yml')

    if (!isYamlFile) {
      return { isValid: false, error: 'Please select a valid YAML file (.yaml or .yml)' }
    }

    try {
      const content = await file.text()
      parse(content) // This will throw if YAML is malformed
      return { isValid: true }
    }
    catch (err: any) {
      return { isValid: false, error: `Invalid YAML format: ${err.message}` }
    }
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const files = data.yamlFile
    const file = files?.[0]

    if (!file) {
      setValidationResult({
        success: false,
        message: 'Please select a file',
      })
      return
    }

    setIsLoading(true)
    setValidationResult(null)

    try {
      // First validate if it's a proper YAML file
      const yamlValidation = await validateYamlFile(file)
      if (!yamlValidation.isValid) {
        setValidationResult({
          success: false,
          message: yamlValidation.error || 'Invalid YAML file',
        })
        return
      }

      // Parse the YAML content
      const fileContent = await file.text()
      const fileData = parse(fileContent)

      // Validate against schema
      const result = ProjectTemplateSchema.safeParse(fileData)

      if (!result.success) {
        const errors: string[] = []

        // Format validation errors
        const formatErrors = (errorObj: any, path: string = '') => {
          if (errorObj._errors && errorObj._errors.length > 0) {
            errorObj._errors.forEach((error: string) => {
              errors.push(`${path ? `${path}: ` : ''}${error}`)
            })
          }

          Object.keys(errorObj).forEach((key) => {
            if (key !== '_errors' && typeof errorObj[key] === 'object') {
              const newPath = path ? `${path}.${key}` : key
              formatErrors(errorObj[key], newPath)
            }
          })
        }

        formatErrors(result.error.format())

        setValidationResult({
          success: false,
          message: 'Validation failed',
          errors,
        })
      }
      else {
        setValidationResult({
          success: true,
          message: 'YAML file is valid! ✅',
        })
      }
    }
    catch (error: any) {
      console.error('Error processing file:', error)
      setValidationResult({
        success: false,
        message: `Error processing file: ${error.message}`,
      })
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Validate Project YAML file</h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload YAML File</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="yamlFile"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Project File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".yaml,.yml"
                        onChange={e => onChange(e.target.files)}
                        {...rest}
                      />
                    </FormControl>
                    <FormDescription>Upload your project YAML file (.yaml or .yml)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Validating...' : 'Validate YAML'}
              </Button>
            </form>
          </Form>

          {/* Validation Results */}
          {validationResult && (
            <div className="mt-6">
              <Alert className={validationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription>
                  <div className={validationResult.success ? 'text-green-800' : 'text-red-800'}>
                    <div className="font-medium mb-2">{validationResult.message}</div>
                    {validationResult.errors && validationResult.errors.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium mb-1">Validation Errors:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          {validationResult.errors.map((error, index) => (
                            <li key={index} className="text-sm">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="mt-6 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
            <p className="font-medium">Instructions:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Select a .yaml or .yml file</li>
              <li>• Click "Validate YAML" to check if the file matches the project template schema</li>
              <li>• Validation results will appear below the form</li>
              <li>• Successfully validated data will be logged to the browser console</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
