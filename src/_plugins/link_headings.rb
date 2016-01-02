# coding: utf-8

require "cgi"

Jekyll::Hooks.register :posts, :post_render do |post|
  post.output = HeadingLinker.link post.output
end

HEADING_REGEX = %r[(<h\d.*?>)(.*?)(</h\d>)]m
ID_REGEX = /\sid=".*?"/

module HeadingLinker
  def self.link content
    content.gsub(HEADING_REGEX) do
      open_tag = $1
      content = $2
      close_tag = $3

      id = strip(content)
      open_tag = if open_tag.match(ID_REGEX)
                 then open_tag.sub(ID_REGEX, %[ id="#{id}"])
                 else open_tag.sub(/(>)$/, %[ id="#{id}">])
                 end
      anchor = %[<a href="##{id}" class="heading-anchor"></a>]

      %[#{open_tag}#{content}#{anchor}#{close_tag}]
    end
  end

  def self.strip content
    c = content.gsub(/<\/?[^>]*>/, "")
    c = CGI.escapeHTML(c)
    c
  end
end
