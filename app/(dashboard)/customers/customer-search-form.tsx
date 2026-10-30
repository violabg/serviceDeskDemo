"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

type CustomerSearchValues = {
  q: string
}

export function CustomerSearchForm({ initialTerm }: { initialTerm: string }) {
  const { register, reset } = useForm<CustomerSearchValues>({
    defaultValues: { q: initialTerm },
  })

  useEffect(() => {
    reset({ q: initialTerm })
  }, [reset, initialTerm])

  return (
    <form action="/customers" method="get" className="flex flex-wrap items-end gap-2">
      <Field>
        <FieldLabel htmlFor="customers-search">Search customers</FieldLabel>
        <Input
          id="customers-search"
          placeholder="Company, primary contact or email"
          {...register("q")}
        />
      </Field>
      <Button type="submit" variant="outline">Search</Button>
      <Button
        variant="outline"
        render={<Link href="/customers" />}
        nativeButton={false}
        onClick={() => reset({ q: "" })}
      >
        Reset Filters
      </Button>
    </form>
  )
}
