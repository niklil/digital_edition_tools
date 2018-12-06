// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  version: '0.9.0',
  server_url: 'localhost:5000',
  api_url: 'http://dockerhost-ext02.sls.fi:8000',
  api_url_path: 'digitaledition',
  project_default: 'topelius',
  image_logo: 'logo.png',
  publisher_configuration: {
    show_remove: false
  },
  selector_configurations: [
    {
      name: 'Personer',
      type: 'subjects',
      descriptionField: 'Karriär',
      sortByColumn: 0,
      elements: [
        'persName', 'rs'
      ],
      elementsXPath: '//*[name() = "persName" or name() = "rs"]',
      attribute: 'corresp'
    },
    {
      name: 'Platser',
      type: 'locations',
      descriptionField: 'Beskrivning',
      sortByColumn: 0,
      elements: [
        'placeName'
      ],
      elementsXPath: '//*[name() = "placeName"]',
      attribute: 'corresp'
    }
  ],
  xml_file_extensions: '.xml,.tei,.txt',
  xml_space_before_trailing_slash: true,
  line_break: '\r\n',
  genres: [
    { key: 'poetry', name: 'Poetry' },
    { key: 'prose', name: 'Prose' },
    { key: 'drama', name: 'Drama' },
    { key: 'non-fiction', name: 'Non-fiction' },
    { key: 'media', name: 'Media' }
  ]
};
