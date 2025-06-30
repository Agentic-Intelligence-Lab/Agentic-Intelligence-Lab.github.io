---
title: Team
nav:
  order: 3
  tooltip: About Our Team
---

# {% include icon.html icon="fa-solid fa-users" %}Team

Meet our outstanding team members! Although based in Hong Kong, our team boasts a diverse group of members and contributors from Mainland China and the United States. A brief bio for each member is provided below.

<!-- Our lab is made up of a talented mix of graduate students, postdoctoral researchers, programmers, and staff, and their backgrounds range from pure computer science to experimental biology. If you’re interested in joining this diverse and dynamic team, please reach out! -->

{% include section.html %}

{% include list.html data="members" component="portrait" filter="role == 'pi'" %}
{% include list.html data="members" component="portrait" filter="role != 'pi'" %}

{% include section.html %}

## Research Interns

- **John Smith**
  - University: University of Hong Kong
  - Degree: Bachelor's
  - Major: Computer Science

- **Jane Doe**
  - University: Stanford University
  - Degree: Master's
  - Major: Bioengineering

- **Alex Chen**
  - University: MIT
  - Degree: PhD Candidate
  - Major: Computational Biology