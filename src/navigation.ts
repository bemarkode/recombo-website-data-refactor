import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Solutions',
      links: [
        {
          text: 'Aviation',
          href: getPermalink('/aviation'),
        },
        {
          text: 'Cross-Industry Platform Automation',
          href: getPermalink('/cross-industry-platform-automation'),
        },
        {
          text: 'Intellectual Property',
          href: getPermalink('/intellectual-property'),
        },
        {
          text: 'Life Sciences',
          href: getPermalink('/life-sciences'),
        },
      ],
    },

    {
      text: 'Company',
      href: getPermalink('/company'),
    },
    {
      text: 'Resources',
      href: getPermalink('/resources'),
    },
  ],
  actions: [{ text: 'Contact', href: getPermalink('/contact'), target: '_blank' }],
};

export const footerData = {
  links: [

  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [

  ],

};
