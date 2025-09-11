
export async function POST(req: Request) {
  const { username, password } = await req.json();

  

  if (
    username === username &&
    password === password
  ) {
    return Response.json({ success: true });
  }

  return Response.json({ success: false }, { status: 401 });
}
