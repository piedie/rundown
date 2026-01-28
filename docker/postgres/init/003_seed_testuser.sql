-- test@landstede.live / testpassword
-- bcrypt hash generated for "testpassword"
insert into users (email, password_hash)
values ('test@landstede.live', '$2b$10$9bw2H5CLsAZskTRHOS79BOvWYLE8fMd8xy0ERe5xzJQqWycHUt4EW')
on conflict (email) do nothing;
