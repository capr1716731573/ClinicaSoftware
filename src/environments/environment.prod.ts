export const environment = {
    production: true,
    apiUrl: '/api',
    //aqui se utiliza porque configure en el ngix que haga ruteo a la carpeta api
    //es decir en local funciona bien pero ya con la ip publica se debe colocar
    //ejemplo
    //local ---> 192.168.91.9:3005  IP PUBLICA---> 181.113.133.226/api
    //apiUrl: 'http://localhost:3005',
    nombreApp: 'ClinicOS',
    filas:10
  };