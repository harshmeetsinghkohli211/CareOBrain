import os

files_to_update = [
    'src/components/common/Header.jsx',
    'src/components/home/HomeHero.jsx',
    'src/components/home/HomeStatsCTA.jsx',
    'src/components/doctor/DoctorDashboard.jsx',
    'src/components/doctor/Neo4jMedicalScanStudio.jsx'
]

# Update Header.jsx
with open('src/components/common/Header.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
if 'getDoctorCdsUrl' not in c:
    c = c.replace('import { NotificationDropdown } from "./NotificationDropdown";',
                  'import { NotificationDropdown } from "./NotificationDropdown";\nimport { getDoctorCdsUrl } from "../../utils/doctorCdsRoute";')
c = c.replace('window.open("/doctor-cds", "_blank")', 'window.open(getDoctorCdsUrl(), "_blank")')
with open('src/components/common/Header.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated Header.jsx")

# Update HomeHero.jsx
with open('src/components/home/HomeHero.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
if 'getDoctorCdsUrl' not in c:
    c = 'import { getDoctorCdsUrl } from "../../utils/doctorCdsRoute";\n' + c
c = c.replace('window.open("/doctor-cds", "_blank")', 'window.open(getDoctorCdsUrl(), "_blank")')
with open('src/components/home/HomeHero.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated HomeHero.jsx")

# Update HomeStatsCTA.jsx
with open('src/components/home/HomeStatsCTA.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
if 'getDoctorCdsUrl' not in c:
    c = 'import { getDoctorCdsUrl } from "../../utils/doctorCdsRoute";\n' + c
c = c.replace('window.open("/doctor-cds", "_blank")', 'window.open(getDoctorCdsUrl(), "_blank")')
c = c.replace('href="/doctor-cds"', 'href={getDoctorCdsUrl()}')
with open('src/components/home/HomeStatsCTA.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated HomeStatsCTA.jsx")

# Update DoctorDashboard.jsx
with open('src/components/doctor/DoctorDashboard.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
if 'getDoctorCdsUrl' not in c:
    c = 'import { getDoctorCdsUrl } from "../../utils/doctorCdsRoute";\n' + c
c = c.replace('href="/doctor-cds"', 'href={getDoctorCdsUrl()}')
with open('src/components/doctor/DoctorDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated DoctorDashboard.jsx")

# Update Neo4jMedicalScanStudio.jsx
with open('src/components/doctor/Neo4jMedicalScanStudio.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
if 'getDoctorCdsUrl' not in c:
    c = 'import { getDoctorCdsUrl } from "../../utils/doctorCdsRoute";\n' + c
c = c.replace('href="/doctor-cds"', 'href={getDoctorCdsUrl()}')
with open('src/components/doctor/Neo4jMedicalScanStudio.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated Neo4jMedicalScanStudio.jsx")
