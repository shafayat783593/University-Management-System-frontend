"use client";

import { useForm } from "@tanstack/react-form";
import { FileText, FileUp, Mail, User } from "lucide-react";
import { isAcceptedFileSize, isAcceptedFileType, MAX_FILE_SIZE } from "@/app/validation";
import { useGetAllDepartment } from "@/hooks/departments.hook";
import { useApplyAsInstructor } from "@/hooks/instructor.hook";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

type Values = { name: string; email: string; departmentId: string; qualification: string; resume: File | null };

export default function InstructorApplyForm() {
    const { data: departments = [], isLoading: departmentsLoading } = useGetAllDepartment();
    const { mutateAsync: applyAsInstructor, isPending } = useApplyAsInstructor();
    const form = useForm({
        defaultValues: { name: "", email: "", departmentId: "", qualification: "", resume: null } as Values,
        onSubmit: async ({ value }) => {
            if (!value.resume) return;
            try {
                await applyAsInstructor({ ...value, resume: value.resume });
                toast.add({ title: "Application submitted", description: "Check your email for the verification OTP.", type: "success" });
                form.reset();
            } catch {
                toast.add({ title: "Could not submit application", description: "Please review your details and try again.", type: "error" });
            }
        },
    });

    return <div className="flex flex-col gap-6">
        <div className="space-y-1.5"><h1 className="text-2xl font-semibold tracking-tight">Apply as an instructor</h1><p className="text-sm text-muted-foreground">Submit your details and resume for review.</p></div>
        <form onSubmit={(event) => { event.preventDefault(); void form.handleSubmit(); }} noValidate>
            <FieldGroup>
        <form.Field name="name" validators={{ onChange: ({ value }) => value.trim().length >= 2 ? undefined : { message: "Enter your full name" } }}>{(field) => <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}><FieldLabel htmlFor={field.name}>Full name</FieldLabel><div className="relative"><User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id={field.name} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} className="pl-9" autoComplete="name" /></div>{field.state.meta.isTouched && !field.state.meta.isValid && <FieldError errors={field.state.meta.errors} />}</Field>}</form.Field>
        <form.Field name="email" validators={{ onChange: ({ value }) => /^\S+@\S+\.\S+$/.test(value) ? undefined : { message: "Enter a valid email address" } }}>{(field) => <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}><FieldLabel htmlFor={field.name}>Email address</FieldLabel><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id={field.name} type="email" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} className="pl-9" autoComplete="email" /></div>{field.state.meta.isTouched && !field.state.meta.isValid && <FieldError errors={field.state.meta.errors} />}</Field>}</form.Field>
        <form.Field name="departmentId" validators={{ onChange: ({ value }) => value ? undefined : { message: "Select a department" } }}>{(field) => <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}><FieldLabel htmlFor={field.name}>Department</FieldLabel><select id={field.name} value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} disabled={departmentsLoading} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"><option value="">{departmentsLoading ? "Loading departments…" : "Select a department"}</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select>{field.state.meta.isTouched && !field.state.meta.isValid && <FieldError errors={field.state.meta.errors} />}</Field>}</form.Field>
                <form.Field name="qualification">{(field) => <Field><FieldLabel htmlFor={field.name}>Qualification <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel><Input id={field.name} placeholder="e.g. MSc in Computer Science" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => field.handleChange(event.target.value)} /></Field>}</form.Field>
        <form.Field name="resume" validators={{ onSubmit: ({ value }) => value ? undefined : { message: "A resume is required" } }}>{(field) => <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}><FieldLabel htmlFor="resume">Resume</FieldLabel><Input id="resume" type="file" accept=".pdf,.doc,.docx,image/png,image/jpeg" onBlur={field.handleBlur} onChange={(event) => { const file = event.target.files?.[0] ?? null; field.handleChange(file && isAcceptedFileSize(file.size) && isAcceptedFileType(file.type) ? file : null); }} /><FieldDescription>{field.state.value ? <span className="inline-flex items-center gap-1"><FileText className="size-4" />{field.state.value.name}</span> : `PDF, DOC, DOCX, PNG, or JPEG up to ${MAX_FILE_SIZE} MB`}</FieldDescription>{field.state.meta.isTouched && !field.state.meta.isValid && <FieldError errors={field.state.meta.errors} />}</Field>}</form.Field>
                <Button type="submit" className="w-full" disabled={isPending || departmentsLoading}>{isPending ? <><Spinner />Submitting…</> : <><FileUp />Submit application</>}</Button>
            </FieldGroup>
        </form>
    </div>;
}
