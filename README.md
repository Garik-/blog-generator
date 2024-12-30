# blog-generator

I'm making a personal medium-style website for myself, which I want to publish on github pages  
I didn't like gatsby because it generates too much garbage, so I wrote my own generator.

```bash
$ ln -s obsidian-folder-path data
$ npm install
$ npm start
$ wget -r http://localhost:3000/
```

## TODO
- [x] article page
- [ ] tags page
- [x] support images
- [x] sass support, compress css  
- [ ] responsive images
- [ ] image zoom
- [x] compress html
- [ ] availability
- [ ] open graph
- [ ] site web manifest
- [x] code highlight
- [x] reading time algorithm