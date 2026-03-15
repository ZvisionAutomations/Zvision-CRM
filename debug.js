import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing config')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
    console.log('--- USERS (Auth) ---')
    const { data: auth, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) console.error(authError)
    else console.log(auth?.users?.map(u => ({ id: u.id, email: u.email })))

    console.log('\n--- COMPANIES (Public) ---')
    const { data: companies, error: compError } = await supabase.from('companies').select('*')
    if (compError) console.error(compError)
    else console.log(companies)

    console.log('\n--- USERS (Public) ---')
    const { data: publicUsers, error: usersError } = await supabase.from('users').select('*')
    if (usersError) console.error(usersError)
    else console.log(publicUsers)
}

run()
