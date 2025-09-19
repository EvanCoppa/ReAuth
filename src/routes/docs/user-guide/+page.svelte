<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
</script>

<svelte:head>
	<title>User Guide - Patient Advocate</title>
</svelte:head>

<div class="container mx-auto p-6 max-w-4xl">
	<div class="mb-8">
		<h1 class="text-4xl font-bold mb-4">User Guide</h1>
		<p class="text-lg text-muted-foreground">
			Learn how to use Patient Advocate to manage your dental practice presentations and patient data effectively.
		</p>
	</div>

	<!-- Getting Started -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>🚀</span>
				Getting Started
			</CardTitle>
			<CardDescription>First steps to begin using the platform</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div>
				<h3 class="font-semibold mb-2">1. Registration & Login</h3>
				<p class="text-sm text-muted-foreground mb-2">
					Create your account using an invite code from your practice administrator.
				</p>
				<ul class="list-disc list-inside text-sm space-y-1 ml-4">
					<li>Navigate to the registration page</li>
					<li>Enter your invite code, email, and personal details</li>
					<li>Complete the registration process</li>
					<li>Log in with your credentials</li>
				</ul>
			</div>
			
			<Separator />
			
			<div>
				<h3 class="font-semibold mb-2">2. Dashboard Overview</h3>
				<p class="text-sm text-muted-foreground">
					The main dashboard provides quick access to all platform features through the sidebar navigation.
				</p>
			</div>
		</CardContent>
	</Card>

	<!-- Core Features -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>⚡</span>
				Core Features
			</CardTitle>
			<CardDescription>Main functionality and tools available</CardDescription>
		</CardHeader>
		<CardContent class="space-y-6">
			<!-- Treatment Plans -->
			<div>
				<h3 class="font-semibold mb-3 flex items-center gap-2">
					📋 Treatment Plans & Visits
					<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">Primary Tool</span>
				</h3>
				<p class="text-sm text-muted-foreground mb-3">
					Comprehensive visit and treatment plan management with full CRUD operations and multimedia support.
				</p>
				<ul class="list-disc list-inside text-sm space-y-1 ml-4">
					<li><strong>Visit Management:</strong> Create, view, update, and delete patient visits</li>
					<li><strong>Patient Information:</strong> Complete client records with contact details</li>
					<li><strong>Provider Assignment:</strong> Link visits to specific healthcare providers</li>
					<li><strong>Detailed Procedures:</strong> Track specific billable procedures per visit</li>
					<li><strong>Image Support:</strong> Attach and manage visit-related images</li>
					<li><strong>Notes System:</strong> Flexible JSON or text-based note taking</li>
					<li><strong>Payment Tracking:</strong> Monitor payment status and amounts</li>
					<li><strong>Search & Filter:</strong> Find visits by doctor, patient, or treatment details</li>
				</ul>
			</div>

			<Separator />

			<!-- Slide Presentations -->
			<div>
				<h3 class="font-semibold mb-3 flex items-center gap-2">
					🎯 Slide Presentations
					<span class="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">Patient Education</span>
				</h3>
				<p class="text-sm text-muted-foreground mb-3">
					Create and present dynamic slide shows for patient education and treatment explanations.
				</p>
				<ul class="list-disc list-inside text-sm space-y-1 ml-4">
					<li><strong>Dynamic Content:</strong> Slides adapt based on patient data</li>
					<li><strong>Print Support:</strong> Generate printable versions for take-home materials</li>
					<li><strong>Customizable:</strong> Tailor presentations to specific treatments</li>
					<li><strong>Professional Templates:</strong> Use pre-designed, dental-focused layouts</li>
				</ul>
			</div>

			<Separator />

			<!-- Form Management -->
			<div>
				<h3 class="font-semibold mb-3 flex items-center gap-2">
					📝 Form Management
					<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium border">Data Collection</span>
				</h3>
				<p class="text-sm text-muted-foreground mb-3">
					Handle patient intake forms and data collection efficiently.
				</p>
				<ul class="list-disc list-inside text-sm space-y-1 ml-4">
					<li><strong>Digital Forms:</strong> Paperless patient intake process</li>
					<li><strong>Auto-save:</strong> Forms automatically save progress</li>
					<li><strong>Validation:</strong> Built-in data validation and error checking</li>
					<li><strong>Integration:</strong> Seamlessly connects with treatment planning</li>
				</ul>
			</div>

			<Separator />

			<!-- Billables Management -->
			<div>
				<h3 class="font-semibold mb-3 flex items-center gap-2">
					💰 Billables & Procedure Codes
					<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium border">Administrative</span>
				</h3>
				<p class="text-sm text-muted-foreground mb-3">
					Comprehensive billing code management with procedure tracking and cost analysis.
				</p>
				<ul class="list-disc list-inside text-sm space-y-1 ml-4">
					<li><strong>Billing Codes:</strong> Create and manage custom billing/procedure codes</li>
					<li><strong>Cost Management:</strong> Set and update standard costs for procedures</li>
					<li><strong>Procedure Categories:</strong> Organize billing codes by categories</li>
					<li><strong>Visit Integration:</strong> Link procedures to specific visits automatically</li>
					<li><strong>Quantity Tracking:</strong> Track multiple procedures per visit</li>
					<li><strong>Financial Reporting:</strong> Generate cost reports and billing summaries</li>
					<li><strong>Code Updates:</strong> Modify existing billing codes and descriptions</li>
				</ul>
			</div>

			<Separator />

			<!-- Client Management -->
			<div>
				<h3 class="font-semibold mb-3 flex items-center gap-2">
					👥 Client Management
					<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">Data Management</span>
				</h3>
				<p class="text-sm text-muted-foreground mb-3">
					Complete patient/client record management with contact information and history.
				</p>
				<ul class="list-disc list-inside text-sm space-y-1 ml-4">
					<li><strong>Patient Records:</strong> Create and maintain comprehensive client profiles</li>
					<li><strong>Contact Information:</strong> Store and update names, emails, phone numbers</li>
					<li><strong>Address Management:</strong> Track patient addresses and location data</li>
					<li><strong>Visit History:</strong> View all visits associated with each client</li>
					<li><strong>Quick Lookup:</strong> Find clients by ID or personal information</li>
					<li><strong>Data Updates:</strong> Modify existing client information as needed</li>
				</ul>
			</div>

			<Separator />

			<!-- Provider Management -->
			<div>
				<h3 class="font-semibold mb-3 flex items-center gap-2">
					👨‍⚕️ Provider Management
					<span class="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">Staff Management</span>
				</h3>
				<p class="text-sm text-muted-foreground mb-3">
					Healthcare provider and staff management with credentials and specialties.
				</p>
				<ul class="list-disc list-inside text-sm space-y-1 ml-4">
					<li><strong>Provider Profiles:</strong> Create and manage healthcare provider records</li>
					<li><strong>Specialties:</strong> Track medical specialties and areas of expertise</li>
					<li><strong>License Management:</strong> Store and verify medical license numbers</li>
					<li><strong>Visit Assignment:</strong> Link providers to specific patient visits</li>
					<li><strong>Performance Tracking:</strong> Monitor provider activity and patient loads</li>
					<li><strong>Credentials:</strong> Maintain professional certification information</li>
				</ul>
			</div>

			<Separator />

			<!-- Image Management -->
			<div>
				<h3 class="font-semibold mb-3 flex items-center gap-2">
					📸 Image & Media Management
					<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium">Multimedia</span>
				</h3>
				<p class="text-sm text-muted-foreground mb-3">
					Comprehensive image management for treatment documentation and patient records.
				</p>
				<ul class="list-disc list-inside text-sm space-y-1 ml-4">
					<li><strong>Visit Images:</strong> Attach multiple images to each patient visit</li>
					<li><strong>File Support:</strong> Handle JPEG, PNG, and other common image formats</li>
					<li><strong>Secure Storage:</strong> Base64 encoded storage with metadata tracking</li>
					<li><strong>Image Retrieval:</strong> Quick access to images by unique ID</li>
					<li><strong>Treatment Documentation:</strong> Visual documentation of procedures</li>
					<li><strong>Before/After:</strong> Progress tracking through sequential imaging</li>
				</ul>
			</div>
		</CardContent>
	</Card>

	<!-- Navigation Guide -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>🧭</span>
				Navigation Guide
			</CardTitle>
			<CardDescription>Understanding the interface and menu structure</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div>
				<h3 class="font-semibold mb-2">Sidebar Menu</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div>
						<p><strong>Tools:</strong></p>
						<ul class="list-disc list-inside ml-4 space-y-1">
							<li>Form - Patient intake forms</li>
							<li>Treatment Plans - Main patient management</li>
							<li>Billables - Financial tracking</li>
						</ul>
					</div>
					<div>
						<p><strong>Settings:</strong></p>
						<ul class="list-disc list-inside ml-4 space-y-1">
							<li>General - User preferences</li>
							<li>Team - Team management</li>
							<li>Billables - Billing configuration</li>
							<li>Form - Form customization</li>
						</ul>
					</div>
				</div>
			</div>
			
			<Separator />
			
			<div>
				<h3 class="font-semibold mb-2">Quick Actions</h3>
				<ul class="list-disc list-inside text-sm space-y-1 ml-4">
					<li><strong>Create Button:</strong> Quick access to form creation</li>
					<li><strong>Home Button:</strong> Return to main dashboard</li>
					<li><strong>User Menu:</strong> Account settings and logout</li>
				</ul>
			</div>
		</CardContent>
	</Card>

	<!-- Best Practices -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>💡</span>
				Best Practices
			</CardTitle>
			<CardDescription>Tips for efficient and effective use</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<ul class="list-disc list-inside text-sm space-y-2">
				<li><strong>Regular Data Backup:</strong> Ensure patient data is regularly backed up through the system</li>
				<li><strong>Consistent Naming:</strong> Use consistent naming conventions for patients and treatments</li>
				<li><strong>Status Updates:</strong> Keep treatment plan statuses current for accurate reporting</li>
				<li><strong>Documentation:</strong> Maintain detailed notes for all patient interactions</li>
				<li><strong>Security:</strong> Always log out when finished and don't share login credentials</li>
				<li><strong>Mobile Responsive:</strong> The platform works on tablets and mobile devices for convenience</li>
			</ul>
		</CardContent>
	</Card>

	<!-- Troubleshooting -->
	<Card class="mb-8">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>🔧</span>
				Troubleshooting
			</CardTitle>
			<CardDescription>Common issues and solutions</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-4">
				<div>
					<h4 class="font-medium">Login Issues</h4>
					<p class="text-sm text-muted-foreground">If you can't log in, verify your email and password. Contact your administrator for password resets.</p>
				</div>
				
				<div>
					<h4 class="font-medium">Slow Loading</h4>
					<p class="text-sm text-muted-foreground">Clear your browser cache and ensure you have a stable internet connection.</p>
				</div>
				
				<div>
					<h4 class="font-medium">Data Not Saving</h4>
					<p class="text-sm text-muted-foreground">Check your internet connection and try refreshing the page. Unsaved changes may be lost.</p>
				</div>
				
				<div>
					<h4 class="font-medium">Print Issues</h4>
					<p class="text-sm text-muted-foreground">Use the dedicated print view for slides and ensure your browser allows pop-ups from this site.</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Support -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<span>🆘</span>
				Support & Contact
			</CardTitle>
			<CardDescription>Get help when you need it</CardDescription>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-muted-foreground mb-4">
				For additional support or technical issues, contact your practice administrator or IT support team.
			</p>
			<div class="bg-muted p-4 rounded-lg">
				<p class="text-sm font-medium">Remember:</p>
				<p class="text-sm text-muted-foreground">
					This platform handles sensitive patient data. Always follow HIPAA guidelines and your practice's data protection policies.
				</p>
			</div>
		</CardContent>
	</Card>
</div>