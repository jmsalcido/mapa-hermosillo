Hand-downloaded source files, used when a portal blocks scripted downloads (CONAPO / CONEVAL answer 403).

- `imu_2020.csv`: CONAPO Índice de Marginación Urbana 2020 (CC-BY 4.0), **trimmed to Hermosillo** (municipio 26030, 530 AGEBs).
- `grs_ageb_2020.csv`: CONEVAL Grado de Rezago Social 2020 by AGEB (CC-BY 4.0), **trimmed to Hermosillo** (622 AGEBs).

Both keep the original header and columns, so a full national download dropped here works the same.
These two files are committed so the weekly GitHub Action can build the Bienestar mode. Anything else
in this folder is git-ignored. See ../README.md.
