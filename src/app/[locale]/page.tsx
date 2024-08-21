import LoginButton from '@/components/LoginButton';
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
  if (!currentUser) {
    return (
      <div className="main-container bg-black flex flex-col gap-3 lg:gap-[2vw] h-screen justify-center items-center text-white font-size-32">
        <h1>Please login to access the app</h1>
        <LoginButton />
      </div>
    );
  }
  return <div />;
}
