const fs = require('fs')
const path = require('path')

const frontendPath = path.join(process.cwd(), 'src/dagl/views/dgkreport/sk_tk_summary.vue')
const backendPath = '/Applications/MAMP/htdocs/cccf/app/cccf/model/Plugins.php'

describe('execution fund summary calculation mode', () => {
  const frontendSource = fs.readFileSync(frontendPath, 'utf8')
  const backendSource = fs.readFileSync(backendPath, 'utf8')

  it('lets the summary page request bill-case or case-only calculations', () => {
    expect(frontendSource).toContain('summary_mode')
    expect(frontendSource).toContain('bill_case')
    expect(frontendSource).toContain('case_only')
  })

  it('builds a separate case-only temp table grouped by case number', () => {
    expect(backendSource).toContain('temp_sk_tk_ah_summary')
    expect(backendSource).toMatch(/GROUP BY ah/)
    expect(backendSource).toMatch(/SUM\(CAST\(REPLACE\(IFNULL\(jzje, '0'\), ',', ''\) AS DECIMAL\(18,2\)\)\) AS sk_je/)
    expect(backendSource).toMatch(/SUM\(CAST\(REPLACE\(IF\(je='' OR je IS NULL, '0', je\), ',', ''\) AS DECIMAL\(18,2\)\)\) AS tk_je/)
    expect(backendSource).toMatch(/MIN\(dzdate\) AS dzdate/)
    expect(backendSource).toMatch(/MAX\(czdate\) AS czdate/)
    expect(backendSource).toMatch(/DATEDIFF\(IF\(czdate IS NOT NULL AND czdate != '', czdate, '\{\$endtime\}'\), dzdate\)/)
  })
})
