import AuthButton from '@/components/AuthButton';
import UsersTable from '@/components/UsersTable';
import { createClient } from '@/utils/supabase/server';

export default async function Index() {
  const supabase = createClient();
  const { data, error } = await supabase.from('roles').select('*');
  const users = data || []; // Ensure users is always an array
  if (error) {
    console.error(error);
    return <div>Failed to fetch users.</div>;
  }
  const currentUserID = await (await supabase.auth.getUser()).data.user?.id;
  const currentUser = users.find((user) => user.user_id === currentUserID);
  if (currentUser?.role !== 'Admin') {
    return (
      <div className="main-container bg-black flex h-screen justify-center items-center text-white font-size-32">
        You have user role and to see this you must be an Admin
      </div>
    );
  }
  return (
    <div>
      <div className="w-full">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
            <h1>Logo</h1>
            <AuthButton />
          </div>
        </nav>
      </div>
      <UsersTable usersData={users} />
    </div>
  );
}
