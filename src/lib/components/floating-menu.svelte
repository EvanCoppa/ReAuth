<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import Menu from '@lucide/svelte/icons/menu';
    import ChevronLeft from '@lucide/svelte/icons/chevron-left';
    import ChevronDown from '@lucide/svelte/icons/chevron-down';
    import Home from '@lucide/svelte/icons/home';
    import Printer from '@lucide/svelte/icons/printer';
    import FileText from '@lucide/svelte/icons/file-text';
    import Download from '@lucide/svelte/icons/download';
     import { toastStore } from '$lib/toast';
    
    let minimized = false;
    
    // Get the ID from the URL parameters
    $: visitId = page.url.pathname.split('/').pop();
    
    function handleBackClick() {
        if (visitId) {
            goto(`/new-form/${visitId}`);
        } else {
            // Fallback to home if no ID found
            goto('/');
        }
    }

    async function handlePDFDownload() {
        try {
            const toastId = toastStore.info('Generating PDF, please wait...', { duration: 25000 });

            const mainElement = document.querySelector('main');
            if (!mainElement) {
                toastStore.removeToast(toastId);
                alert('No main element found to generate PDF');
                return;
            }
            
            const html = mainElement.outerHTML;
            
            // const response = await generatePDF(html);
            
            // if (response.ok) {
            //     const blob = await response.blob();
            //     const url = window.URL.createObjectURL(blob);
            //     const a = document.createElement('a');
            //     a.href = url;
            //     a.download = 'slides.pdf';
            //     document.body.appendChild(a);
            //     a.click();
            //     window.URL.revokeObjectURL(url);
            //     document.body.removeChild(a);
            //     toastStore.removeToast(toastId);
            // } else {
            //     const errorText = await response.text();
            //     console.error('PDF generation failed:', errorText);
            //     toastStore.removeToast(toastId);
            //     alert(`Failed to generate PDF: ${response.status} ${response.statusText}`);
            // }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
</script>

<div
    class="fixed top-6 left-6 z-50 flex flex-col gap-3 bg-black bg-opacity-80 rounded-xl shadow-lg p-3 transition-all hover:scale-105 no-print"
    style="backdrop-filter: blur(4px); width: auto; height: auto;"
>
    {#if minimized}
        <button
            class="flex items-center justify-center text-white bg-gray-800 rounded-full w-12 h-12 transition"
            aria-label="Expand menu"
            on:click={() => minimized = false}
        >
            <Menu class="h-6 w-6" />
        </button>
    {:else}
        <div class="flex gap-2 self-end mb-2 mx-auto">
            <button
                class="flex items-center justify-center text-white bg-gray-800 rounded-full w-10 h-10 transition"
                aria-label="Back"
                on:click={handleBackClick}
            >
                <ChevronLeft class="h-7 w-7" />
            </button>
            <button
                class="flex items-center justify-center text-white bg-gray-800 rounded-full w-10 h-10 transition"
                aria-label="Minimize menu"
                on:click={() => minimized = true}
            >
                <ChevronDown class="h-7 w-7 transform " />
            </button>
        </div>
        <!-- <button
            class="flex items-center gap-2 text-white hover:bg-gray-800 rounded-lg px-3 py-2 transition"
            on:click={() => goto("/")}
            aria-label="Home"
        >
            <Home class="h-5 w-5" />
            Home
        </button> -->
        <button
            class="flex items-center gap-2 text-white hover:bg-gray-800 rounded-lg px-3 py-2 transition"
            on:click={() => goto("/treatment-plans")}
            aria-label="Treatment Plans"
        >
            <FileText class="h-5 w-5" />
            Plans
        </button>
        <button
            class="flex items-center gap-2 text-white hover:bg-gray-800 rounded-lg px-3 py-2 transition"
            on:click={() => window.print()}
            aria-label="Print"
        >
            <Printer class="h-5 w-5" />
            Print
        </button>
        <button
            class="flex items-center gap-2 text-white hover:bg-gray-800 rounded-lg px-3 py-2 transition"
            on:click={handlePDFDownload}
            aria-label="Download PDF"
        >
            <Download class="h-5 w-5" />
            PDF
        </button>
    {/if}
</div>

<style>
    /* Hide floating menu during printing */
    @media print {
        div {
            display: none !important;
        }
    }
</style>