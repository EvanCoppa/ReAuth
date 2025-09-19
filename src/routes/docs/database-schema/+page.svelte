<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
</script>

<svelte:head>
	<title>Database Schema - Patient Advocate</title>
</svelte:head>

<div class="container mx-auto p-6 max-w-6xl">
	<div class="mb-8">
		<h1 class="text-4xl font-bold mb-4">Database Schema Documentation</h1>
		<p class="text-lg text-muted-foreground">
			Technical documentation of the database structure and relationships for the Patient Advocate platform.
		</p>
	</div>

	<!-- Architecture Overview -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>🏗️</span>
				Architecture Overview
			</CardTitle>
			<CardDescription>System architecture and data flow</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div>
				<h3 class="font-semibold mb-2">Database Services</h3>
				<ul class="list-disc list-inside text-sm space-y-1 ml-4">
					<li><strong>Supabase:</strong> Primary authentication and user profiles database</li>
					<li><strong>External API:</strong> Treatment plans and visit data (smile-design-manhattan-api.vercel.app)</li>
					<li><strong>Hybrid Architecture:</strong> Combines Supabase for auth with external API for business data</li>
				</ul>
			</div>
			
			<Separator />
			
			<div>
				<h3 class="font-semibold mb-2">Data Flow</h3>
				<div class="bg-muted p-4 rounded-lg text-sm">
					<p class="mb-2"><strong>Authentication Flow:</strong></p>
					<p class="mb-4">User Login → Supabase Auth → JWT Token → API Requests → External Backend</p>
					
					<p class="mb-2"><strong>Data Access Pattern:</strong></p>
					<p>Client → Supabase (Auth) → External API (Business Data) → Response</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Supabase Schema -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>🔐</span>
				Supabase Schema
				<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">Authentication</span>
			</CardTitle>
			<CardDescription>User authentication and profile management</CardDescription>
		</CardHeader>
		<CardContent class="space-y-6">
			<!-- Auth Users Table -->
			<div>
				<h3 class="font-semibold mb-3">auth.users (Built-in Supabase Auth)</h3>
				<Table>
					<TableCaption>Standard Supabase authentication users table</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Column</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Constraints</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>id</TableCell>
							<TableCell>UUID</TableCell>
							<TableCell>Primary key, unique user identifier</TableCell>
							<TableCell>PRIMARY KEY</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>email</TableCell>
							<TableCell>VARCHAR</TableCell>
							<TableCell>User email address</TableCell>
							<TableCell>UNIQUE, NOT NULL</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>encrypted_password</TableCell>
							<TableCell>VARCHAR</TableCell>
							<TableCell>Hashed password</TableCell>
							<TableCell>NOT NULL</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>raw_user_meta_data</TableCell>
							<TableCell>JSONB</TableCell>
							<TableCell>User metadata (first_name, last_name, full_name)</TableCell>
							<TableCell>-</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>created_at</TableCell>
							<TableCell>TIMESTAMP</TableCell>
							<TableCell>Account creation timestamp</TableCell>
							<TableCell>NOT NULL</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>email_confirmed_at</TableCell>
							<TableCell>TIMESTAMP</TableCell>
							<TableCell>Email verification timestamp</TableCell>
							<TableCell>-</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>

			<Separator />

			<!-- Profiles Table -->
			<div>
				<h3 class="font-semibold mb-3">public.profiles</h3>
				<p class="text-sm text-muted-foreground mb-3">Extended user profile information linked to auth users</p>
				<Table>
					<TableCaption>Custom profiles table for additional user data</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Column</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Constraints</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>id</TableCell>
							<TableCell>SERIAL</TableCell>
							<TableCell>Auto-incrementing primary key</TableCell>
							<TableCell>PRIMARY KEY</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>auth_user_id</TableCell>
							<TableCell>UUID</TableCell>
							<TableCell>Reference to auth.users.id</TableCell>
							<TableCell>FOREIGN KEY, UNIQUE</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>org_id</TableCell>
							<TableCell>VARCHAR</TableCell>
							<TableCell>Organization/practice identifier</TableCell>
							<TableCell>NOT NULL</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>first_name</TableCell>
							<TableCell>VARCHAR</TableCell>
							<TableCell>User's first name</TableCell>
							<TableCell>NOT NULL</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>last_name</TableCell>
							<TableCell>VARCHAR</TableCell>
							<TableCell>User's last name</TableCell>
							<TableCell>NOT NULL</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>pending</TableCell>
							<TableCell>BOOLEAN</TableCell>
							<TableCell>Account approval status</TableCell>
							<TableCell>DEFAULT true</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>created_at</TableCell>
							<TableCell>TIMESTAMP</TableCell>
							<TableCell>Profile creation timestamp</TableCell>
							<TableCell>DEFAULT NOW()</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>updated_at</TableCell>
							<TableCell>TIMESTAMP</TableCell>
							<TableCell>Last profile update</TableCell>
							<TableCell>DEFAULT NOW()</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>
		</CardContent>
	</Card>

	<!-- External API Schema -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>🌐</span>
				External API Schema
				<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">Business Data</span>
			</CardTitle>
			<CardDescription>Treatment plans and visit data from external backend</CardDescription>
		</CardHeader>
		<CardContent class="space-y-6">
			<!-- Database Tables -->
			<div>
				<h3 class="font-semibold mb-3">Database Tables Overview</h3>
				<p class="text-sm text-muted-foreground mb-4">
					The API uses Supabase PostgreSQL with the following main tables:
				</p>
				
				<div class="space-y-6">
					<!-- Visits Table -->
					<div>
						<h4 class="font-medium mb-2">visits</h4>
						<Table>
							<TableCaption>Core visit/treatment plan records</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Column</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Constraints</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>visitid</TableCell>
									<TableCell>SERIAL</TableCell>
									<TableCell>Primary key, auto-incrementing</TableCell>
									<TableCell>PRIMARY KEY</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>clientid</TableCell>
									<TableCell>INTEGER</TableCell>
									<TableCell>Foreign key to clients table</TableCell>
									<TableCell>REFERENCES clients(clientid)</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>providerid</TableCell>
									<TableCell>INTEGER</TableCell>
									<TableCell>Foreign key to providers table</TableCell>
									<TableCell>REFERENCES providers(providerid)</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>visitdate</TableCell>
									<TableCell>TIMESTAMP</TableCell>
									<TableCell>Date and time of visit</TableCell>
									<TableCell>NOT NULL</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>paid</TableCell>
									<TableCell>DECIMAL</TableCell>
									<TableCell>Payment amount</TableCell>
									<TableCell>DEFAULT 0</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>notes</TableCell>
									<TableCell>TEXT</TableCell>
									<TableCell>Visit notes (JSON or plain text)</TableCell>
									<TableCell>-</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>

					<!-- Clients Table -->
					<div>
						<h4 class="font-medium mb-2">clients</h4>
						<Table>
							<TableCaption>Patient/client information</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Column</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Constraints</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>clientid</TableCell>
									<TableCell>SERIAL</TableCell>
									<TableCell>Primary key, auto-incrementing</TableCell>
									<TableCell>PRIMARY KEY</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>name</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>Client's full name</TableCell>
									<TableCell>NOT NULL</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>email</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>Client's email address</TableCell>
									<TableCell>UNIQUE</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>phone</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>Contact phone number</TableCell>
									<TableCell>-</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>address</TableCell>
									<TableCell>TEXT</TableCell>
									<TableCell>Client's address</TableCell>
									<TableCell>-</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>

					<!-- Providers Table -->
					<div>
						<h4 class="font-medium mb-2">providers</h4>
						<Table>
							<TableCaption>Healthcare providers/doctors</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Column</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Constraints</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>providerid</TableCell>
									<TableCell>SERIAL</TableCell>
									<TableCell>Primary key, auto-incrementing</TableCell>
									<TableCell>PRIMARY KEY</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>name</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>Provider's full name</TableCell>
									<TableCell>NOT NULL</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>speciality</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>Medical speciality</TableCell>
									<TableCell>-</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>license</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>Medical license number</TableCell>
									<TableCell>UNIQUE</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>

					<!-- Billables Table -->
					<div>
						<h4 class="font-medium mb-2">billables</h4>
						<Table>
							<TableCaption>Billing codes and procedures</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Column</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Constraints</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>billablecode</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>Primary key, billing code</TableCell>
									<TableCell>PRIMARY KEY</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>description</TableCell>
									<TableCell>TEXT</TableCell>
									<TableCell>Procedure description</TableCell>
									<TableCell>NOT NULL</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>cost</TableCell>
									<TableCell>DECIMAL</TableCell>
									<TableCell>Standard cost for procedure</TableCell>
									<TableCell>NOT NULL</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>category</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>Procedure category</TableCell>
									<TableCell>-</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>

					<!-- Visit Details Table -->
					<div>
						<h4 class="font-medium mb-2">visitdetails</h4>
						<Table>
							<TableCaption>Detailed visit information and procedures</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Column</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Constraints</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>id</TableCell>
									<TableCell>SERIAL</TableCell>
									<TableCell>Primary key, auto-incrementing</TableCell>
									<TableCell>PRIMARY KEY</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>visitid</TableCell>
									<TableCell>INTEGER</TableCell>
									<TableCell>Foreign key to visits table</TableCell>
									<TableCell>REFERENCES visits(visitid)</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>billablecode</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>Foreign key to billables table</TableCell>
									<TableCell>REFERENCES billables(billablecode)</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>quantity</TableCell>
									<TableCell>INTEGER</TableCell>
									<TableCell>Number of procedures performed</TableCell>
									<TableCell>DEFAULT 1</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>notes</TableCell>
									<TableCell>TEXT</TableCell>
									<TableCell>Procedure-specific notes</TableCell>
									<TableCell>-</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>

					<!-- Visit Images Table -->
					<div>
						<h4 class="font-medium mb-2">visitimages</h4>
						<Table>
							<TableCaption>Images associated with visits</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead>Column</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Constraints</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>imageid</TableCell>
									<TableCell>SERIAL</TableCell>
									<TableCell>Primary key, auto-incrementing</TableCell>
									<TableCell>PRIMARY KEY</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>visitid</TableCell>
									<TableCell>INTEGER</TableCell>
									<TableCell>Foreign key to visits table</TableCell>
									<TableCell>REFERENCES visits(visitid)</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>imagename</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>Original filename</TableCell>
									<TableCell>NOT NULL</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>imagetype</TableCell>
									<TableCell>VARCHAR</TableCell>
									<TableCell>MIME type (image/jpeg, image/png)</TableCell>
									<TableCell>NOT NULL</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>imagedata</TableCell>
									<TableCell>BYTEA</TableCell>
									<TableCell>Base64 encoded image data</TableCell>
									<TableCell>NOT NULL</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>
				</div>
			</div>

			<Separator />

			<!-- Notes Structure -->
			<div>
				<h3 class="font-semibold mb-3">Notes Field Structure</h3>
				<p class="text-sm text-muted-foreground mb-3">
					The notes field can contain either plain text or structured JSON data
				</p>
				
				<div class="space-y-4">
					<div>
						<h4 class="font-medium mb-2">Structured JSON Format:</h4>
						<div class="bg-muted p-4 rounded-lg">
							<pre class="text-xs overflow-x-auto"><code class="language-json">&#123;
  "doctor": "Dr. Smith",
  "name": "John Doe", 
  "notes": "Root canal treatment completed"
&#125;</code></pre>
						</div>
					</div>
					
					<div>
						<h4 class="font-medium mb-2">Alternative Array Format:</h4>
						<div class="bg-muted p-4 rounded-lg">
							<pre class="text-xs overflow-x-auto"><code class="language-json">&#123;
  "doctor": "Dr. Johnson",
  "name": "Jane Smith",
  "notes": ["Cleaning completed", "Follow-up scheduled"]
&#125;</code></pre>
						</div>
					</div>
					
					<div>
						<h4 class="font-medium mb-2">Plain Text Format:</h4>
						<div class="bg-muted p-4 rounded-lg">
							<pre class="text-xs overflow-x-auto"><code class="language-json">"Simple text note about the treatment"</code></pre>
						</div>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Data Relationships -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>🔗</span>
				Data Relationships
			</CardTitle>
			<CardDescription>How different data entities connect</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-4">
				<div>
					<h3 class="font-semibold mb-2">Authentication Relationships</h3>
					<ul class="list-disc list-inside text-sm space-y-1 ml-4">
						<li><strong>auth.users ↔ profiles:</strong> One-to-one relationship via auth_user_id</li>
						<li><strong>profiles.org_id:</strong> Groups users by organization/practice</li>
						<li><strong>JWT Token:</strong> Contains user ID for API authentication</li>
					</ul>
				</div>

				<Separator />

				<div>
					<h3 class="font-semibold mb-2">Business Data Relationships</h3>
					<ul class="list-disc list-inside text-sm space-y-1 ml-4">
						<li><strong>visits.clientid:</strong> References patient records (external system)</li>
						<li><strong>visits.providerid:</strong> References healthcare provider (external system)</li>
						<li><strong>Organizational Filtering:</strong> Data access filtered by user's org_id (planned feature)</li>
					</ul>
				</div>

				<Separator />

				<div>
					<h3 class="font-semibold mb-2">Missing Relationships (Future Enhancement)</h3>
					<div class="bg-yellow-50 p-4 rounded-lg">
						<ul class="list-disc list-inside text-sm space-y-1">
							<li>Direct link between Supabase profiles and external API data</li>
							<li>Proper organizational data filtering</li>
							<li>User role and permission management</li>
							<li>Audit trail for data changes</li>
						</ul>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- API Endpoints -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>🔌</span>
				API Endpoints
			</CardTitle>
			<CardDescription>Available data access points</CardDescription>
		</CardHeader>
		<CardContent class="space-y-6">
			<!-- Authentication Endpoints -->
			<div>
				<h3 class="font-semibold mb-3">Authentication Endpoints</h3>
				<Table>
					<TableCaption>User authentication and registration</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Endpoint</TableHead>
							<TableHead>Method</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Authentication</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>/register</TableCell>
							<TableCell>POST</TableCell>
							<TableCell>Register new user via Supabase Auth</TableCell>
							<TableCell>None</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/login</TableCell>
							<TableCell>POST</TableCell>
							<TableCell>Authenticate user and get JWT token</TableCell>
							<TableCell>None</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/users</TableCell>
							<TableCell>GET</TableCell>
							<TableCell>Get authenticated user information</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>

			<!-- Client Management -->
			<div>
				<h3 class="font-semibold mb-3">Client Management</h3>
				<Table>
					<TableCaption>Patient/client operations</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Endpoint</TableHead>
							<TableHead>Method</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Authentication</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>/clients</TableCell>
							<TableCell>GET</TableCell>
							<TableCell>Fetch all clients</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/clients/&#123;id&#125;</TableCell>
							<TableCell>GET</TableCell>
							<TableCell>Fetch specific client by ID</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/clients</TableCell>
							<TableCell>POST</TableCell>
							<TableCell>Create new client record</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/clients/&#123;id&#125;</TableCell>
							<TableCell>PUT</TableCell>
							<TableCell>Update existing client</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/clients/&#123;id&#125;</TableCell>
							<TableCell>DELETE</TableCell>
							<TableCell>Delete client record</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>

			<!-- Provider Management -->
			<div>
				<h3 class="font-semibold mb-3">Provider Management</h3>
				<Table>
					<TableCaption>Healthcare provider operations</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Endpoint</TableHead>
							<TableHead>Method</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Authentication</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>/providers</TableCell>
							<TableCell>GET</TableCell>
							<TableCell>Fetch all providers</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/providers</TableCell>
							<TableCell>POST</TableCell>
							<TableCell>Create new provider record</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/providers/&#123;id&#125;</TableCell>
							<TableCell>PUT</TableCell>
							<TableCell>Update existing provider</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/providers/&#123;id&#125;</TableCell>
							<TableCell>DELETE</TableCell>
							<TableCell>Delete provider record</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>

			<!-- Visit Management -->
			<div>
				<h3 class="font-semibold mb-3">Visit/Treatment Plan Management</h3>
				<Table>
					<TableCaption>Core treatment plan and visit operations</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Endpoint</TableHead>
							<TableHead>Method</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Authentication</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>/visits</TableCell>
							<TableCell>GET</TableCell>
							<TableCell>Fetch all visits/treatment plans</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/visits/&#123;id&#125;</TableCell>
							<TableCell>GET</TableCell>
							<TableCell>Fetch specific visit with details and images</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/visits</TableCell>
							<TableCell>POST</TableCell>
							<TableCell>Create new visit with details and images</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/visits/&#123;id&#125;</TableCell>
							<TableCell>PUT</TableCell>
							<TableCell>Update existing visit</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/visits/&#123;id&#125;</TableCell>
							<TableCell>DELETE</TableCell>
							<TableCell>Delete visit and related data</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>

			<!-- Billables Management -->
			<div>
				<h3 class="font-semibold mb-3">Billables Management</h3>
				<Table>
					<TableCaption>Billing codes and procedure management</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Endpoint</TableHead>
							<TableHead>Method</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Authentication</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>/billables</TableCell>
							<TableCell>GET</TableCell>
							<TableCell>Fetch all billing codes</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/billables</TableCell>
							<TableCell>POST</TableCell>
							<TableCell>Create new billing code</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/billables/&#123;code&#125;</TableCell>
							<TableCell>PUT</TableCell>
							<TableCell>Update existing billing code</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/billables/&#123;code&#125;</TableCell>
							<TableCell>DELETE</TableCell>
							<TableCell>Delete billing code</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>

			<!-- Image Management -->
			<div>
				<h3 class="font-semibold mb-3">Image Management</h3>
				<Table>
					<TableCaption>Visit image operations</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Endpoint</TableHead>
							<TableHead>Method</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Authentication</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>/images/&#123;id&#125;</TableCell>
							<TableCell>GET</TableCell>
							<TableCell>Fetch specific image by ID</TableCell>
							<TableCell>JWT Bearer Token</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>

			<!-- Utility Endpoints -->
			<div>
				<h3 class="font-semibold mb-3">Utility Endpoints</h3>
				<Table>
					<TableCaption>System information and utilities</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Endpoint</TableHead>
							<TableHead>Method</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Authentication</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>/api</TableCell>
							<TableCell>GET</TableCell>
							<TableCell>API information and version</TableCell>
							<TableCell>None</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>/schema</TableCell>
							<TableCell>GET</TableCell>
							<TableCell>Database schema information</TableCell>
							<TableCell>None</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>
		</CardContent>
	</Card>

	<!-- Security Considerations -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>🔒</span>
				Security & Privacy
			</CardTitle>
			<CardDescription>Data protection and security measures</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-4">
				<div>
					<h3 class="font-semibold mb-2">Authentication Security</h3>
					<ul class="list-disc list-inside text-sm space-y-1 ml-4">
						<li><strong>JWT Tokens:</strong> Secure token-based authentication</li>
						<li><strong>Password Encryption:</strong> Bcrypt hashing via Supabase</li>
						<li><strong>Email Verification:</strong> Required for account activation</li>
						<li><strong>Rate Limiting:</strong> Protection against brute force attempts</li>
					</ul>
				</div>

				<Separator />

				<div>
					<h3 class="font-semibold mb-2">Data Protection</h3>
					<ul class="list-disc list-inside text-sm space-y-1 ml-4">
						<li><strong>HTTPS Only:</strong> All data transmission encrypted</li>
						<li><strong>Organizational Isolation:</strong> Users only access their org's data</li>
						<li><strong>Pending Approval:</strong> New accounts require manual approval</li>
						<li><strong>API Authentication:</strong> All external API calls require valid JWT</li>
					</ul>
				</div>

				<Separator />

			 
			</div>
		</CardContent>
	</Card>

 	 
</div>