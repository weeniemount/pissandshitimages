import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple template renderer
function renderTemplate(templateName, data = {}) {
    const templatePath = path.join(__dirname, '..', 'views', `${templateName}.html`)
    let template = fs.readFileSync(templatePath, 'utf8')
    
    // Replace all template variables with data
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        template = template.replace(regex, value || '')
    }
    
    // Handle conditional blocks
    template = template.replace(/{{#if\s+(\w+)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g, (match, condition, ifBlock, elseBlock) => {
        return data[condition] ? ifBlock : elseBlock
    })
    
    template = template.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, ifBlock) => {
        return data[condition] ? ifBlock : ''
    })
    
    // Handle each loops
    template = template.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, itemTemplate) => {
        const array = data[arrayName] || []
        return array.map(item => {
            let itemHtml = itemTemplate
            for (const [key, value] of Object.entries(item)) {
                const regex = new RegExp(`{{this\\.${key}}}`, 'g')
                itemHtml = itemHtml.replace(regex, value || '')
            }
            return itemHtml
        }).join('')
    })
    
    return template
}

export { renderTemplate }
