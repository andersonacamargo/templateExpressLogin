import { z } from "zod"
export const createUserFormSchema = z.object({
    nome: z.string()
        .nonempty("Username is required")
        .regex(/^[A-Za-z]+$/i, "Only letters are allowed"),
    senha: z.string()
        .nonempty("Password is required")
        .min(8)
        .regex(/\d/,"A string deve conter pelo menos um numeral"),
    confirma_senha: z.string()
        .nonempty("Confirm password is required"),
    email: z.email()
})
    .refine(({ senha, confirma_senha }) => senha === confirma_senha, {
        message: "Password doesn't match",
        path: ["confirm_password"]
    })
    .refine((senha) => /[a-z]/.test(senha), {
        message: 'A string deve conter pelo menos uma letra minúscula',
    })
    .refine((senha) => /[A-Z]/.test(senha), {
        message: 'A string deve conter pelo menos uma letra maiúscula',
    })


