import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion.js'

const faqItems = [
  {
    question: 'How do I add a new project?',
    answer: 'If you are a professor or research supervisor, you can submit a project by logging in to your account and going to the Projects page. Please note that you need to make the project public after submission from the right sidebar.',
  },
  {
    question: 'What happens after the last application date passes?',
    answer: 'After the last application date has passed, the project will no longer be visible to students under the Open Projects section. To make it visible again, please update the deadline to a future date.',
  },
  {
    question: 'How does the application process work?',
    answer: 'Currently, students can apply to all projects regardless of the set requirements. Professors can view all applications, and can choose to close the project to stop accepting any more.',
  },
  {
    question: 'Who can see my resume?',
    answer: 'If you have uploaded a resume, it will be visible to professors who have posted projects. It is not visible to other students.',
  },
]

export default function About() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="h2 my-5 font-bold">About</h2>
        <p className="text-lg mx-5">

          This project portal has been created with the collaboration of&nbsp;
          <a
            target="_blank"
            href="https://devclub.iitd.ac.in/"
            className="text-primary hover:underline"
          >
            DevClub
          </a>
          {' '}
          and&nbsp;
          <a target="_blank" href="https://sac.iitd.ac.in/" className="text-primary hover:underline">Student Affair's Council</a>
          . This is a prototype build, which means that it lacks the some other planned features.
          We are open to suggestions and feedback, so feel free to reach out to us.
        </p>
      </section>

      <section className="bg-white px-7 py-5 rounded-xl shadow-md mx-5">
        <h2 className="h3">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-[16px]">{item.question}</AccordionTrigger>
              <AccordionContent className="text-[14px]">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="bg-white px-7 py-5 rounded-xl shadow-md mx-5">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          Have any questions or suggestions? Found a bug? (we're sure there might be some lurking)
          Feel free to contact us from any of the below options. New ideas are welcome, though keep in mind that this is
          a prototype version of the website.
        </p>
        <ul className="space-y-2">
          <li>
            <strong>Email:</strong>
            {' '}
            <a target="_blank" href="mailto:me2241111@mech.iitd.ac.in" className="text-indigo-600 hover:underline">
              me2241111@mech.iitd.ac.in
            </a>
          </li>
          <li>
            <strong>GitHub Issues:</strong>
            {' '}
            <a target="_blank" href="https://github.com/0xDevansh/projector/issues" className="text-indigo-600 hover:underline">
              Go to GitHub
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}
