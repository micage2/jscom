# jscom
Component Framework (inspired by COM) in pure Javascript, no frameworks.

Simplicity is your friend ... but hard to achieve.

Below a diagram for source and sink connections of of two example components:

![list-view](https://github.com/user-attachments/assets/9b8e445c-7291-4ec7-8341-6d499032646d)
<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill-opacity="1" color-rendering="auto" color-interpolation="auto" text-rendering="auto" stroke="black" stroke-linecap="square" width="947" stroke-miterlimit="10" shape-rendering="auto" stroke-opacity="1" fill="black" stroke-dasharray="none" font-weight="normal" stroke-width="1" height="1005" font-family="'Dialog'" font-style="normal" stroke-linejoin="miter" font-size="12px" stroke-dashoffset="0" image-rendering="auto">
  <defs id="genericDefs"/>
  <g>
    <defs id="defs1">
      <clipPath clipPathUnits="userSpaceOnUse" id="clipPath1">
        <path d="M0 0 L947 0 L947 1005 L0 1005 L0 0 Z"/>
      </clipPath>
      <clipPath clipPathUnits="userSpaceOnUse" id="clipPath2">
        <path d="M257 34 L1204 34 L1204 1039 L257 1039 L257 34 Z"/>
      </clipPath>
    </defs>
    <g fill="white" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="translate(-257,-34)" stroke="white">
      <rect x="257" width="947" height="1005" y="34" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g fill="rgb(229,229,229)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(229,229,229)">
      <rect x="366.415" y="341.9" clip-path="url(#clipPath2)" width="822.12" rx="4" ry="4" height="681.9265" stroke="none"/>
      <rect x="366.415" y="341.9" clip-path="url(#clipPath2)" fill="rgb(235,235,235)" width="59.8545" height="22.3765" stroke="none"/>
    </g>
    <g font-size="15px" stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" text-rendering="geometricPrecision" font-family="sans-serif" shape-rendering="geometricPrecision" stroke-miterlimit="1.45">
      <text x="368.415" xml:space="preserve" y="358.9806" clip-path="url(#clipPath2)" stroke="none">ListView</text>
    </g>
    <g fill="rgb(209,209,209)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(209,209,209)">
      <rect x="558.535" y="379.2765" clip-path="url(#clipPath2)" width="474.88" rx="4" ry="4" height="294.3868" stroke="none"/>
      <rect x="558.535" y="379.2765" clip-path="url(#clipPath2)" fill="rgb(235,235,235)" width="108.1943" height="22.3765" stroke="none"/>
    </g>
    <g font-size="15px" stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" text-rendering="geometricPrecision" font-family="sans-serif" shape-rendering="geometricPrecision" stroke-miterlimit="1.45">
      <text x="560.535" xml:space="preserve" y="396.357" clip-path="url(#clipPath2)" stroke="none">ListItem (folder)</text>
    </g>
    <g fill="rgb(255,204,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(255,204,0)">
      <rect x="738.315" y="433.2015" clip-path="url(#clipPath2)" width="121" rx="4" ry="4" height="30" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <rect x="738.315" y="433.2015" clip-path="url(#clipPath2)" fill="none" width="121" rx="4" ry="4" height="30"/>
      <text x="776.1451" xml:space="preserve" y="452.9153" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">self click</text>
    </g>
    <g fill="rgb(189,189,189)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(189,189,189)">
      <rect x="582.335" y="544.6368" clip-path="url(#clipPath2)" width="435.76" rx="4" ry="4" height="114.0265" stroke="none"/>
      <rect x="582.335" y="544.6368" clip-path="url(#clipPath2)" fill="rgb(235,235,235)" width="144.9106" height="22.3765" stroke="none"/>
    </g>
    <g font-size="15px" stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" text-rendering="geometricPrecision" font-family="sans-serif" shape-rendering="geometricPrecision" stroke-miterlimit="1.45">
      <text x="584.335" xml:space="preserve" y="561.7173" clip-path="url(#clipPath2)" stroke="none">ToggleButton (folder)</text>
    </g>
    <g fill="rgb(255,204,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(255,204,0)">
      <rect x="739.715" y="597.8382" clip-path="url(#clipPath2)" width="121" rx="4" ry="4" height="30" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <rect x="739.715" y="597.8382" clip-path="url(#clipPath2)" fill="none" width="121" rx="4" ry="4" height="30"/>
      <text x="777.5451" xml:space="preserve" y="617.5521" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">self click</text>
    </g>
    <g fill="rgb(93,144,195)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(93,144,195)">
      <rect x="889.095" y="582.0132" clip-path="url(#clipPath2)" width="114" rx="4" ry="4" height="61.65" stroke="none"/>
      <path fill="white" d="M904.095 597.8383 L979.695 597.8383 L988.095 612.8383 L979.695 627.8383 L904.095 627.8383 L912.495 612.8383 Z" clip-path="url(#clipPath2)" fill-rule="evenodd" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M904.095 597.8383 L979.695 597.8383 L988.095 612.8383 L979.695 627.8383 L904.095 627.8383 L912.495 612.8383 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="927.7551" xml:space="preserve" y="617.5521" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">clicked</text>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" stroke-dasharray="6,2" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M864.7253 612.8383 L897.4557 612.8383" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill-opacity="0" fill="rgb(0,0,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke-dasharray="6,2" stroke="rgb(0,0,0)" stroke-opacity="0" stroke-miterlimit="1.45">
      <path d="M856.7253 612.8383 C856.7253 610.6291 858.5161 608.8383 860.7253 608.8383 C862.9344 608.8383 864.7253 610.6291 864.7253 612.8383 C864.7253 615.0474 862.9344 616.8383 860.7253 616.8383 C858.5161 616.8383 856.7253 615.0474 856.7253 612.8383 Z" stroke="none" clip-path="url(#clipPath2)"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M856.7253 612.8383 C856.7253 610.6291 858.5161 608.8383 860.7253 608.8383 C862.9344 608.8383 864.7253 610.6291 864.7253 612.8383 C864.7253 615.0474 862.9344 616.8383 860.7253 616.8383 C858.5161 616.8383 856.7253 615.0474 856.7253 612.8383 Z" clip-path="url(#clipPath2)"/>
      <path fill="white" stroke-dasharray="6,2" d="M912.4557 612.8383 L896.4557 606.8383 L896.4557 618.8383 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M912.4557 612.8383 L896.4557 606.8383 L896.4557 618.8383 Z" clip-path="url(#clipPath2)"/>
      <rect x="880.405" y="610.8382" clip-path="url(#clipPath2)" fill="white" width="4" stroke-dasharray="6,2" height="4" stroke="none"/>
    </g>
    <g fill="rgb(195,144,76)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(195,144,76)">
      <rect x="597.335" y="582.0132" clip-path="url(#clipPath2)" width="114" rx="4" ry="4" height="61.65" stroke="none"/>
      <rect x="573.535" y="418.2015" clip-path="url(#clipPath2)" fill="rgb(215,164,96)" width="120" rx="4" ry="4" height="111.4353" stroke="none"/>
      <path fill="white" d="M588.535 433.2015 L669.535 433.2015 L678.535 448.2015 L669.535 463.2015 L588.535 463.2015 L597.535 448.2015 Z" clip-path="url(#clipPath2)" fill-rule="evenodd" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M588.535 433.2015 L669.535 433.2015 L678.535 448.2015 L669.535 463.2015 L588.535 463.2015 L597.535 448.2015 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="624.1981" xml:space="preserve" y="452.9153" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">title</text>
    </g>
    <g fill="white" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="white">
      <path d="M588.535 484.6368 L669.535 484.6368 L678.535 499.6368 L669.535 514.6368 L588.535 514.6368 L597.535 499.6368 Z" fill-rule="evenodd" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M588.535 484.6368 L669.535 484.6368 L678.535 499.6368 L669.535 514.6368 L588.535 514.6368 L597.535 499.6368 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="619.5281" xml:space="preserve" y="504.3506" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">show</text>
    </g>
    <g fill="rgb(113,164,215)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(113,164,215)">
      <rect x="904.095" y="417.3765" clip-path="url(#clipPath2)" width="114" rx="4" ry="4" height="61.65" stroke="none"/>
      <path fill="white" d="M919.095 433.2015 L994.695 433.2015 L1003.095 448.2015 L994.695 463.2015 L919.095 463.2015 L927.495 448.2015 Z" clip-path="url(#clipPath2)" fill-rule="evenodd" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M919.095 433.2015 L994.695 433.2015 L1003.095 448.2015 L994.695 463.2015 L919.095 463.2015 L927.495 448.2015 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="942.7551" xml:space="preserve" y="452.9153" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">clicked</text>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" stroke-dasharray="6,2" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M863.3134 448.2015 L912.4494 448.2015" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill-opacity="0" fill="rgb(0,0,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke-dasharray="6,2" stroke="rgb(0,0,0)" stroke-opacity="0" stroke-miterlimit="1.45">
      <path d="M855.3134 448.2015 C855.3134 445.9923 857.1042 444.2015 859.3134 444.2015 C861.5226 444.2015 863.3134 445.9923 863.3134 448.2015 C863.3134 450.4106 861.5226 452.2015 859.3134 452.2015 C857.1042 452.2015 855.3134 450.4106 855.3134 448.2015 Z" stroke="none" clip-path="url(#clipPath2)"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M855.3134 448.2015 C855.3134 445.9923 857.1042 444.2015 859.3134 444.2015 C861.5226 444.2015 863.3134 445.9923 863.3134 448.2015 C863.3134 450.4106 861.5226 452.2015 859.3134 452.2015 C857.1042 452.2015 855.3134 450.4106 855.3134 448.2015 Z" clip-path="url(#clipPath2)"/>
      <path fill="white" stroke-dasharray="6,2" d="M927.4494 448.2015 L911.4494 442.2015 L911.4494 454.2015 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M927.4494 448.2015 L911.4494 442.2015 L911.4494 454.2015 Z" clip-path="url(#clipPath2)"/>
      <rect x="887.205" y="446.2015" clip-path="url(#clipPath2)" fill="white" width="4" stroke-dasharray="6,2" height="4" stroke="none"/>
    </g>
    <g fill="rgb(235,235,235)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(235,235,235)">
      <rect x="564.715" width="56.5146" height="22.3765" y="920.2" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g font-size="15px" stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" text-rendering="geometricPrecision" font-family="sans-serif" shape-rendering="geometricPrecision" stroke-miterlimit="1.45">
      <text x="566.715" xml:space="preserve" y="937.2806" clip-path="url(#clipPath2)" stroke="none">ListItem</text>
      <rect x="564.715" y="920.2" clip-path="url(#clipPath2)" fill="none" width="468.7" stroke-dasharray="6,2" rx="4" ry="4" height="82.3765"/>
      <rect x="717.835" y="957.5765" clip-path="url(#clipPath2)" fill="none" width="121" stroke-dasharray="6,2" rx="4" ry="4" height="30"/>
      <text x="773.334" xml:space="preserve" font-size="12px" y="977.2903" clip-path="url(#clipPath2)" stroke="none">...</text>
    </g>
    <g fill="rgb(235,184,116)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(235,184,116)">
      <rect x="381.415" y="380" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="260" stroke="none"/>
      <path fill="white" d="M396.415 395 L477.415 395 L486.415 410 L477.415 425 L396.415 425 L405.415 410 Z" clip-path="url(#clipPath2)" fill-rule="evenodd" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M396.415 395 L477.415 395 L486.415 410 L477.415 425 L396.415 425 L405.415 410 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="425.7412" xml:space="preserve" y="414.7139" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">select</text>
    </g>
    <g fill="white" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="white">
      <path d="M396.415 445 L477.415 445 L486.415 460 L477.415 475 L396.415 475 L405.415 460 Z" fill-rule="evenodd" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M396.415 445 L477.415 445 L486.415 460 L477.415 475 L396.415 475 L405.415 460 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="418.0713" xml:space="preserve" y="464.7139" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">add-item</text>
    </g>
    <g fill="white" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="white">
      <path d="M396.415 595 L505.315 595 L517.415 610 L505.315 625 L396.415 625 L408.515 610 Z" fill-rule="evenodd" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M396.415 595 L505.315 595 L517.415 610 L505.315 625 L396.415 625 L408.515 610 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="412.5625" xml:space="preserve" y="614.7139" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">remove-selected</text>
    </g>
    <g fill="white" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="white">
      <path d="M396.415 545 L477.415 545 L486.415 560 L477.415 575 L396.415 575 L405.415 560 Z" fill-rule="evenodd" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M396.415 545 L477.415 545 L486.415 560 L477.415 575 L396.415 575 L405.415 560 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="425.0674" xml:space="preserve" y="564.7139" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">toggle</text>
    </g>
    <g fill="white" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="white">
      <path d="M396.415 495 L477.415 495 L486.415 510 L477.415 525 L396.415 525 L405.415 510 Z" fill-rule="evenodd" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M396.415 495 L477.415 495 L486.415 510 L477.415 525 L396.415 525 L405.415 510 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="414.3974" xml:space="preserve" y="514.7139" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">add-folder</text>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill="rgb(255,102,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(255,102,0)" stroke-width="2" stroke-miterlimit="1.45">
      <path fill="none" d="M1007.6297 448.2015 L1042 448.2015 L1046.375 447.5765 L1049.5 445.7015 L1051.375 442.5765 L1052 438.2015 L1052 332 L1051.375 327.625 L1049.5 324.5 L1046.375 322.625 L1042 322 L337 322 L332.625 322.625 L329.5 324.5 L327.625 327.625 L327 332 L327 401.65 L327.6249 406.016 L329.4998 409.114 L332.6244 410.9439 L336.999 411.5058 L388.2005 410.7674" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill-opacity="0" fill="rgb(0,0,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(0,0,0)" stroke-width="2" stroke-opacity="0" stroke-miterlimit="1.45">
      <path d="M998.6297 448.2015 C998.6297 445.7162 1000.6444 443.7015 1003.1297 443.7015 C1005.615 443.7015 1007.6297 445.7162 1007.6297 448.2015 C1007.6297 450.6868 1005.615 452.7015 1003.1297 452.7015 C1000.6444 452.7015 998.6297 450.6868 998.6297 448.2015 Z" stroke="none" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill="rgb(255,102,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(255,102,0)" stroke-miterlimit="1.45">
      <path fill="none" d="M998.6297 448.2015 C998.6297 445.7162 1000.6444 443.7015 1003.1297 443.7015 C1005.615 443.7015 1007.6297 445.7162 1007.6297 448.2015 C1007.6297 450.6868 1005.615 452.7015 1003.1297 452.7015 C1000.6444 452.7015 998.6297 450.6868 998.6297 448.2015 Z" clip-path="url(#clipPath2)"/>
      <path fill="white" d="M405.0737 410.5241 L386.9783 404.0344 L387.1729 417.533 Z" stroke-width="2" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M405.0737 410.5241 L386.9783 404.0344 L387.1729 417.533 Z" clip-path="url(#clipPath2)"/>
      <rect x="1013.22" y="446.2015" clip-path="url(#clipPath2)" fill="white" width="4" height="4" stroke="none" stroke-width="2"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill="rgb(255,102,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(255,102,0)" stroke-width="2" stroke-miterlimit="1.45">
      <path fill="none" d="M992.5735 612.8383 L1055.75 612.8383 L1060.125 613.4633 L1063.25 615.3383 L1065.125 618.4633 L1065.75 622.8383 L1065.75 677 L1065.125 681.375 L1063.25 684.5 L1060.125 686.375 L1055.75 687 L339.5 687 L335.125 686.375 L332 684.5 L330.125 681.375 L329.5 677 L329.5 570 L330.125 565.625 L332 562.5 L335.125 560.625 L339.5 560 L388.5556 560" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill-opacity="0" fill="rgb(0,0,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(0,0,0)" stroke-width="2" stroke-opacity="0" stroke-miterlimit="1.45">
      <path d="M983.5735 612.8383 C983.5735 610.353 985.5883 608.3383 988.0735 608.3383 C990.5588 608.3383 992.5735 610.353 992.5735 612.8383 C992.5735 615.3235 990.5588 617.3383 988.0735 617.3383 C985.5883 617.3383 983.5735 615.3235 983.5735 612.8383 Z" stroke="none" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill="rgb(255,102,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(255,102,0)" stroke-miterlimit="1.45">
      <path fill="none" d="M983.5735 612.8383 C983.5735 610.353 985.5883 608.3383 988.0735 608.3383 C990.5588 608.3383 992.5735 610.353 992.5735 612.8383 C992.5735 615.3235 990.5588 617.3383 988.0735 617.3383 C985.5883 617.3383 983.5735 615.3235 983.5735 612.8383 Z" clip-path="url(#clipPath2)"/>
      <path fill="white" d="M405.4306 560 L387.4306 553.25 L387.4306 566.75 Z" stroke-width="2" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M405.4306 560 L387.4306 553.25 L387.4306 566.75 Z" clip-path="url(#clipPath2)"/>
      <rect x="998.22" y="610.8382" clip-path="url(#clipPath2)" fill="white" width="4" height="4" stroke="none" stroke-width="2"/>
    </g>
    <g fill="rgb(133,184,235)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(133,184,235)">
      <rect x="1059.535" y="380" clip-path="url(#clipPath2)" width="114" rx="4" ry="4" height="61.65" stroke="none"/>
      <path fill="white" d="M1074.535 396.65 L1150.135 396.65 L1158.535 411.65 L1150.135 426.65 L1074.535 426.65 L1082.9351 411.65 Z" clip-path="url(#clipPath2)" fill-rule="evenodd" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M1074.535 396.65 L1150.135 396.65 L1158.535 411.65 L1150.135 426.65 L1074.535 426.65 L1082.9351 411.65 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="1094.1874" xml:space="preserve" y="416.3639" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">selected</text>
    </g>
    <g fill="rgb(209,209,209)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(209,209,209)">
      <rect x="558.535" y="715.7816" clip-path="url(#clipPath2)" width="474.88" rx="4" ry="4" height="162.3" stroke="none"/>
      <rect x="558.535" y="715.7816" clip-path="url(#clipPath2)" fill="rgb(235,235,235)" width="129.0464" height="22.3765" stroke="none"/>
    </g>
    <g font-size="15px" stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" text-rendering="geometricPrecision" font-family="sans-serif" shape-rendering="geometricPrecision" stroke-miterlimit="1.45">
      <text x="560.535" xml:space="preserve" y="732.8622" clip-path="url(#clipPath2)" stroke="none">ListItem (no folder)</text>
    </g>
    <g fill="rgb(255,204,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(255,204,0)">
      <rect x="738.315" y="768.1581" clip-path="url(#clipPath2)" width="121" rx="4" ry="4" height="30" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <rect x="738.315" y="768.1581" clip-path="url(#clipPath2)" fill="none" width="121" rx="4" ry="4" height="30"/>
      <text x="776.1451" xml:space="preserve" y="787.8719" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">self click</text>
    </g>
    <g fill="rgb(215,164,96)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(215,164,96)">
      <rect x="573.535" y="753.1581" clip-path="url(#clipPath2)" width="120" rx="4" ry="4" height="109.9235" stroke="none"/>
      <path fill="white" d="M588.535 818.0817 L669.535 818.0817 L678.535 833.0817 L669.535 848.0817 L588.535 848.0817 L597.535 833.0817 Z" clip-path="url(#clipPath2)" fill-rule="evenodd" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M588.535 818.0817 L669.535 818.0817 L678.535 833.0817 L669.535 848.0817 L588.535 848.0817 L597.535 833.0817 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="619.5281" xml:space="preserve" y="837.7955" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">show</text>
    </g>
    <g fill="white" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="white">
      <path d="M588.535 768.1582 L669.535 768.1582 L678.535 783.1582 L669.535 798.1582 L588.535 798.1582 L597.535 783.1582 Z" fill-rule="evenodd" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M588.535 768.1582 L669.535 768.1582 L678.535 783.1582 L669.535 798.1582 L588.535 798.1582 L597.535 783.1582 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="624.1981" xml:space="preserve" y="787.8719" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">title</text>
    </g>
    <g fill="rgb(113,164,215)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(113,164,215)">
      <rect x="904.095" y="753.1581" clip-path="url(#clipPath2)" width="114" rx="4" ry="4" height="61.65" stroke="none"/>
      <path fill="white" d="M919.095 768.1582 L994.695 768.1582 L1003.095 783.1582 L994.695 798.1582 L919.095 798.1582 L927.495 783.1582 Z" clip-path="url(#clipPath2)" fill-rule="evenodd" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M919.095 768.1582 L994.695 768.1582 L1003.095 783.1582 L994.695 798.1582 L919.095 798.1582 L927.495 783.1582 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="942.7551" xml:space="preserve" y="787.8719" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">clicked</text>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" stroke-dasharray="6,2" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M863.3134 783.1581 L912.4494 783.1581" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill-opacity="0" fill="rgb(0,0,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke-dasharray="6,2" stroke="rgb(0,0,0)" stroke-opacity="0" stroke-miterlimit="1.45">
      <path d="M855.3134 783.1581 C855.3134 780.9489 857.1042 779.1581 859.3134 779.1581 C861.5226 779.1581 863.3134 780.9489 863.3134 783.1581 C863.3134 785.3672 861.5226 787.1581 859.3134 787.1581 C857.1042 787.1581 855.3134 785.3672 855.3134 783.1581 Z" stroke="none" clip-path="url(#clipPath2)"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M855.3134 783.1581 C855.3134 780.9489 857.1042 779.1581 859.3134 779.1581 C861.5226 779.1581 863.3134 780.9489 863.3134 783.1581 C863.3134 785.3672 861.5226 787.1581 859.3134 787.1581 C857.1042 787.1581 855.3134 785.3672 855.3134 783.1581 Z" clip-path="url(#clipPath2)"/>
      <path fill="white" stroke-dasharray="6,2" d="M927.4494 783.1581 L911.4494 777.1581 L911.4494 789.1581 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M927.4494 783.1581 L911.4494 777.1581 L911.4494 789.1581 Z" clip-path="url(#clipPath2)"/>
      <rect x="887.205" y="781.1581" clip-path="url(#clipPath2)" fill="white" width="4" stroke-dasharray="6,2" height="4" stroke="none"/>
    </g>
    <g fill="rgb(229,229,229)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(229,229,229)">
      <rect x="391.655" y="49.7235" clip-path="url(#clipPath2)" width="434.8081" rx="4" ry="4" height="241" stroke="none"/>
      <rect x="391.655" y="49.7235" clip-path="url(#clipPath2)" fill="rgb(235,235,235)" width="54.8594" height="22.3765" stroke="none"/>
    </g>
    <g font-size="15px" stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" text-rendering="geometricPrecision" font-family="sans-serif" shape-rendering="geometricPrecision" stroke-miterlimit="1.45">
      <text x="393.655" xml:space="preserve" y="66.8041" clip-path="url(#clipPath2)" stroke="none">Toolbar</text>
    </g>
    <g fill="rgb(209,209,209)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(209,209,209)">
      <rect x="409.655" y="87.7235" clip-path="url(#clipPath2)" width="400.76" rx="4" ry="4" height="82.3765" stroke="none"/>
      <rect x="409.655" y="87.7235" clip-path="url(#clipPath2)" fill="rgb(235,235,235)" width="47.3667" height="22.3765" stroke="none"/>
    </g>
    <g font-size="15px" stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" text-rendering="geometricPrecision" font-family="sans-serif" shape-rendering="geometricPrecision" stroke-miterlimit="1.45">
      <text x="411.655" xml:space="preserve" y="104.8041" clip-path="url(#clipPath2)" stroke="none">Button</text>
    </g>
    <g fill="rgb(204,255,255)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(204,255,255)">
      <path d="M711.415 125.1 L787.015 125.1 L795.415 140.1 L787.015 155.1 L711.415 155.1 L719.815 140.1 Z" fill-rule="evenodd" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M711.415 125.1 L787.015 125.1 L795.415 140.1 L787.015 155.1 L711.415 155.1 L719.815 140.1 Z" fill-rule="evenodd" clip-path="url(#clipPath2)"/>
      <text x="735.0751" xml:space="preserve" y="144.8139" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">clicked</text>
    </g>
    <g fill="rgb(255,204,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(255,204,0)">
      <rect x="548.655" y="125.1" clip-path="url(#clipPath2)" width="121" rx="4" ry="4" height="30" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <rect x="548.655" y="125.1" clip-path="url(#clipPath2)" fill="none" width="121" rx="4" ry="4" height="30"/>
      <text x="586.4851" xml:space="preserve" y="144.8139" clip-path="url(#clipPath2)" font-family="sans-serif" stroke="none">self click</text>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill="rgb(255,102,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(255,102,0)" stroke-width="2" stroke-miterlimit="1.45">
      <path fill="none" d="M799.9308 140.1 L863.3431 140.1 L867.7181 140.725 L870.8431 142.6 L872.7181 145.725 L873.3431 150.1 L873.3431 295.2313 L872.7181 299.6063 L870.8431 302.7313 L867.7181 304.6063 L863.3431 305.2313 L315.3431 305.2313 L310.9681 305.8563 L307.8431 307.7313 L305.9681 310.8563 L305.3431 315.2313 L305.3431 450 L305.9681 454.375 L307.8431 457.5 L310.9681 459.375 L315.3431 460 L388.562 460" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill-opacity="0" fill="rgb(0,0,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(0,0,0)" stroke-width="2" stroke-opacity="0" stroke-miterlimit="1.45">
      <path d="M790.9308 140.1 C790.9308 137.6147 792.9456 135.6 795.4308 135.6 C797.9161 135.6 799.9308 137.6147 799.9308 140.1 C799.9308 142.5853 797.9161 144.6 795.4308 144.6 C792.9456 144.6 790.9308 142.5853 790.9308 140.1 Z" stroke="none" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill="rgb(255,102,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(255,102,0)" stroke-miterlimit="1.45">
      <path fill="none" d="M790.9308 140.1 C790.9308 137.6147 792.9456 135.6 795.4308 135.6 C797.9161 135.6 799.9308 137.6147 799.9308 140.1 C799.9308 142.5853 797.9161 144.6 795.4308 144.6 C792.9456 144.6 790.9308 142.5853 790.9308 140.1 Z" clip-path="url(#clipPath2)"/>
      <path fill="white" d="M405.437 460 L387.437 453.25 L387.437 466.75 Z" stroke-width="2" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M405.437 460 L387.437 453.25 L387.437 466.75 Z" clip-path="url(#clipPath2)"/>
      <rect x="836.9416" y="138.1" clip-path="url(#clipPath2)" fill="white" width="4" height="4" stroke="none" stroke-width="2"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" stroke-dasharray="6,2" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M673.6273 140.1 L704.8263 140.1" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill-opacity="0" fill="rgb(0,0,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke-dasharray="6,2" stroke="rgb(0,0,0)" stroke-opacity="0" stroke-miterlimit="1.45">
      <path d="M665.6273 140.1 C665.6273 137.8909 667.4181 136.1 669.6273 136.1 C671.8364 136.1 673.6273 137.8909 673.6273 140.1 C673.6273 142.3091 671.8364 144.1 669.6273 144.1 C667.4181 144.1 665.6273 142.3091 665.6273 140.1 Z" stroke="none" clip-path="url(#clipPath2)"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke-linecap="butt">
      <path fill="none" d="M665.6273 140.1 C665.6273 137.8909 667.4181 136.1 669.6273 136.1 C671.8364 136.1 673.6273 137.8909 673.6273 140.1 C673.6273 142.3091 671.8364 144.1 669.6273 144.1 C667.4181 144.1 665.6273 142.3091 665.6273 140.1 Z" clip-path="url(#clipPath2)"/>
      <path fill="white" stroke-dasharray="6,2" d="M719.8263 140.1 L703.8263 134.1 L703.8263 146.1 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M719.8263 140.1 L703.8263 134.1 L703.8263 146.1 Z" clip-path="url(#clipPath2)"/>
      <rect x="688.535" y="138.1" clip-path="url(#clipPath2)" fill="white" width="4" stroke-dasharray="6,2" height="4" stroke="none"/>
    </g>
    <g fill="rgb(235,235,235)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,-257,-34)" stroke="rgb(235,235,235)">
      <rect x="409.655" width="47.3667" height="22.3765" y="191.0353" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g font-size="15px" stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" text-rendering="geometricPrecision" font-family="sans-serif" shape-rendering="geometricPrecision" stroke-miterlimit="1.45">
      <text x="411.655" xml:space="preserve" y="208.1159" clip-path="url(#clipPath2)" stroke="none">Button</text>
      <rect x="409.655" y="191.0353" clip-path="url(#clipPath2)" fill="none" width="401.8081" stroke-dasharray="6,2" rx="4" ry="4" height="84.6882"/>
      <rect x="548.655" y="230.7235" clip-path="url(#clipPath2)" fill="none" width="121" stroke-dasharray="6,2" rx="4" ry="4" height="30"/>
      <text x="604.1541" xml:space="preserve" font-size="12px" y="250.4374" clip-path="url(#clipPath2)" stroke="none">...</text>
      <path fill="none" stroke-dasharray="6,2" d="M710.535 230.7235 L786.135 230.7235 L794.535 245.7235 L786.135 260.7235 L710.535 260.7235 L718.935 245.7235 Z" clip-path="url(#clipPath2)" fill-rule="evenodd"/>
      <text x="734.1951" xml:space="preserve" font-size="12px" y="250.4374" clip-path="url(#clipPath2)" stroke="none">clicked</text>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill="rgb(255,102,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(255,102,0)" stroke-width="2" stroke-miterlimit="1.45">
      <path fill="none" d="M799.0453 245.7235 L842 245.7235 L846.375 246.3485 L849.5 248.2235 L851.375 251.3485 L852 255.7235 L852 287 L851.375 291.375 L849.5 294.5 L846.375 296.375 L842 297 L282 297 L277.625 297.625 L274.5 299.5 L272.625 302.625 L272 307 L272 500 L272.625 504.375 L274.5 507.5 L277.625 509.375 L282 510 L388.5145 510" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill-opacity="0" fill="rgb(0,0,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(0,0,0)" stroke-width="2" stroke-opacity="0" stroke-miterlimit="1.45">
      <path d="M790.0453 245.7235 C790.0453 243.2383 792.0601 241.2235 794.5453 241.2235 C797.0306 241.2235 799.0453 243.2383 799.0453 245.7235 C799.0453 248.2088 797.0306 250.2235 794.5453 250.2235 C792.0601 250.2235 790.0453 248.2088 790.0453 245.7235 Z" stroke="none" clip-path="url(#clipPath2)"/>
    </g>
    <g stroke-linecap="butt" transform="matrix(1,0,0,1,-257,-34)" fill="rgb(255,102,0)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" stroke="rgb(255,102,0)" stroke-miterlimit="1.45">
      <path fill="none" d="M790.0453 245.7235 C790.0453 243.2383 792.0601 241.2235 794.5453 241.2235 C797.0306 241.2235 799.0453 243.2383 799.0453 245.7235 C799.0453 248.2088 797.0306 250.2235 794.5453 250.2235 C792.0601 250.2235 790.0453 248.2088 790.0453 245.7235 Z" clip-path="url(#clipPath2)"/>
      <path fill="white" d="M405.3895 510 L387.3895 503.25 L387.3895 516.75 Z" stroke-width="2" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M405.3895 510 L387.3895 503.25 L387.3895 516.75 Z" clip-path="url(#clipPath2)"/>
      <rect x="804.66" y="243.7235" clip-path="url(#clipPath2)" fill="white" width="4" height="4" stroke="none" stroke-width="2"/>
    </g>
  </g>
</svg>
