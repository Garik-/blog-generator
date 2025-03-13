# blog-generator

I'm making a personal medium-style website for myself, which I want to publish on github pages  
I didn't like gatsby because it generates too much garbage, so I wrote my own generator.

![mem](docs/mem.jpg)

## MD file format

post-title.md

```md
---
tags:
  - architecture
  - golang
---

![[post_image.png]]

post description

post content

![[post_content_image.png]]

![[post_content_image2.png]]
with caption
```

Any yaml code can be placed between special characters at the beginning of the file. It will be deserialized as post attributes.  
You can use any markup in the [github format](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).

The publication date of the article is taken from the file information, you can change the file date using the command

```bash
$ touch -t 202111042100 post-title.md
```

`[[CC]YY]MMDDhhmm[.SS]` where `202111042100` = Nov 4, 2021 21:00

## Usage

```bash
$ ln -s obsidian-public data
$ ln -s obsidian-images images
$ npm install
$ npm start
$ npm run publish

```

## TODO

- [x] article page
- [x] tags page
- [x] support images
- [x] sass support
- [x] compress css
- [x] responsive images
- [x] compress html
- [ ] availability
- [x] open graph
- [x] json+ld
- [x] sitemap.xml
- [ ] site web manifest
- [x] code highlight
- [x] reading time algorithm
- [ ] pinned stories
- [x] styled cache problem
