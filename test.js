const context = String(`
<p>Это первый параграф</p>
<p>Это содержание
А тут значит идет <a href="http://ya.ru/">такой текст</a> и я хочу <code>подсветить</code> чето<br>
Тут значит список:</p>
<ul>
<li>1</li>
<li>2</li>
<li>3</li>
<li>4</li>
</ul>
<p>![[test1.png]]</p>
<h1>заголовок 1</h1>
<h2>заголовок 2</h2>
<h3>заголовок 3![[test3.png]]</h3>
<h4>заголовок 4</h4>
<h5>заголовок 5</h5>
<h6>заголовок 6</h6>
<p><strong>жирный</strong> ==подчеркнутый== <del>зачернкнутый</del> <em>курсив</em></p>
<p>![[test2.png]]</p>
<pre><code class="hljs language-js"><span class="hljs-keyword">const</span> filePath = path.<span class="hljs-title function_">join</span>(<span class="hljs-variable constant_">DATA_PATH</span>, file);
<span class="hljs-keyword">const</span> stats = <span class="hljs-keyword">await</span> fs.<span class="hljs-title function_">stat</span>(filePath)
<span class="hljs-keyword">const</span> title = <span class="hljs-title function_">removeFileExtension</span>(file)`)


function replaceImages(context) {
    const regex = /\<\p\>\!\[\[([^\]]+)\]\]\<\/p\>/mg;
    const match = context.matchAll(regex)

    const createSrcset = (file, format = '', sizes = [640, 720, 750, 768, 828, 1100, 1400]) => {
        return sizes.map(size => {
            return `/v1/resize:fit:${size}/${format ? `format:${format}/` : ''}${file} ${size}w`
        }).join(", ")
    }

    for (const m of match) {
        const [src, file] = m

        const sizes = "(min-resolution: 4dppx) and (max-width: 700px) 50vw, (-webkit-min-device-pixel-ratio: 4) and (max-width: 700px) 50vw, (min-resolution: 3dppx) and (max-width: 700px) 67vw, (-webkit-min-device-pixel-ratio: 3) and (max-width: 700px) 65vw, (min-resolution: 2.5dppx) and (max-width: 700px) 80vw, (-webkit-min-device-pixel-ratio: 2.5) and (max-width: 700px) 80vw, (min-resolution: 2dppx) and (max-width: 700px) 100vw, (-webkit-min-device-pixel-ratio: 2) and (max-width: 700px) 100vw, 700px"


        const figure = `
<figure>
    <picture>
        <source srcset="${createSrcset(file, 'webp')}" sizes="${sizes}" type="image/webp">
        <source srcset="${createSrcset(file, 'webp')}" sizes="${sizes}">
        <img alt="" loading="lazy" role="presentation" src="/v1/resize:fit:1400/${file}">
    </picture>
</figure>
`

        context = context.replace(src, figure)
    }
    return context;
}

console.log(replaceImages(context))
