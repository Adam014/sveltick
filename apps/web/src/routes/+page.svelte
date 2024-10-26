<script>
    import metricsimage from "../assets/metrics.svg"
    import terminal from "../assets/terminal.svg"

</script>

<div>
    <div class="flex align-center pt-8 items-center justify-center">
        <div class="pr-48">
            <h1 class="meet ibm-plex-serif-light">Meet</h1>
            <h1 class="sveltick">Sveltick.</h1>
        </div>
        <img src={metricsimage} alt="metrics-image" />
    </div>
    <div class="flex align-center pt-16 items-center justify-center title-bottom-container">
        <p class="w-1/3">The performance-tracking library for Web. Lightweight and dynamic designed specially for your Svelte apps. It allows developers to easily monitor key performance metrics, page views.    </p>
        <div>
            <div>
                <a href="/introduction"><button class="white-button" style="width: 10rem">Get Started</button></a>
                <a href="/showcase"><button class="black-button" style="width: 10rem">Learn Sveltick</button></a>
            </div>
            <span class="flex pt-4 justify-end items-center">
                <img src={terminal} alt="terminal-icon" style="width: 30px"/>
                <p class="pl-2 underline">~ npm i sveltick</p>
            </span>
        </div>
     </div>
</div>