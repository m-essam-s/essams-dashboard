'use server'
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CustomerSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    imageUrl: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

const CreateCustomer = CustomerSchema.omit({ id: true });
const UpdateCustomer = CustomerSchema.omit({ id: true });


export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Update Invoice.',
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {

    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Invoice.',
        };
    }

    revalidatePath('/dashboard/invoices');
}

export async function createCustomer(formData: FormData) {
    const { name, email, imageUrl } = CreateCustomer.parse({
        name: formData.get('name'),
        email: formData.get('email'),
        imageUrl: formData.get('imageUrl'),
    });

    try {
        await sql`
    INSERT INTO customers (name, email, image_url)
    VALUES (${name}, ${email}, ${imageUrl})
  `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Customer.',
        };
    }

    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

export async function updateCustomer(id: string, formData: FormData) {
    const { name, email, imageUrl } = UpdateCustomer.parse({
        name: formData.get('name'),
        email: formData.get('email'),
        imageUrl: formData.get('imageUrl'),
    });

    try {
        await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}, image_url = ${imageUrl}
      WHERE id = ${id}
    `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Update Customer.',
        };
    }

    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

export async function deleteCustomerInvoices(id: string) {
    try {
        await sql`DELETE FROM invoices WHERE customer_id = ${id}`;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Customer Invoices.',
        };
    }
    revalidatePath('/dashboard/customers');
}

export async function deleteCustomer(id: string) {
    try {
        await sql`DELETE FROM customers WHERE id = ${id}`;
        deleteCustomerInvoices(id);
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Customer.',
        };
    }
    revalidatePath('/dashboard/customers');
}