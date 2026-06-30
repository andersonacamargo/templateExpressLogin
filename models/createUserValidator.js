const { z } = require("zod");

const createUserFormSchema = z.object({
    nome: z.string()
        .min(1, "Username is required") // Fixed .nonempty
        .regex(/^[A-Za-z\s]+$/i, "Only letters are allowed"), // Added \s to allow spaces in names
    senha: z.string()
        .min(1, "Password is required") // Fixed .nonempty
        .min(8, "Mínimo 8 caracteres")
        .regex(/\d/, "A string deve conter pelo menos um numeral")
        .regex(/[a-z]/, "A string deve conter pelo menos uma letra minúscula") // Moved inside senha object
        .regex(/[A-Z]/, "A string deve conter pelo menos uma letra maiúscula"), // Moved inside senha object
    confirma_senha: z.string()
        .min(1, "Confirm password is required"), // Fixed .nonempty
    email: z.string().email("Email inválido") // Added z.string() target before .email()
})
.refine((data) => data.senha === data.confirma_senha, {
    message: "Password doesn't match",
    path: ["confirma_senha"] // Path targeting your form field
});

module.exports = { createUserFormSchema };