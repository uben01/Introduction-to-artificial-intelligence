## Functions

<dl>
<dt><a href="#init">init(c, playerdata, selfindex)</a></dt>
<dd><p>API function to initialize the environment</p>
</dd>
<dt><a href="#movefunction">movefunction(c, playerdata, selfindex)</a> ⇒ <code>Object</code></dt>
<dd><p>API function to calculate each movement</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Coordinate">Coordinate</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#PlayerData">PlayerData</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="init"></a>

## init(c, playerdata, selfindex)
API function to initialize the environment

**Kind**: global function  

| Param | Type |
| --- | --- |
| c | <code>Array.&lt;Array.&lt;number&gt;&gt;</code> | 
| playerdata | [<code>PlayerData</code>](#PlayerData) | 
| selfindex | <code>number</code> | 

<a name="movefunction"></a>

## movefunction(c, playerdata, selfindex) ⇒ <code>Object</code>
API function to calculate each movement

**Kind**: global function  

| Param | Type |
| --- | --- |
| c | <code>Array.&lt;Array.&lt;number&gt;&gt;</code> | 
| playerdata | [<code>Array.&lt;PlayerData&gt;</code>](#PlayerData) | 
| selfindex | <code>number</code> | 

<a name="Coordinate"></a>

## Coordinate : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X coordinate |
| y | <code>number</code> | Y coordinate |
| cost | <code>number</code> | Cost of getting there |

<a name="PlayerData"></a>

## PlayerData : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| oldpos | [<code>Coordinate</code>](#Coordinate) | Last position of the player |
| pos | [<code>Coordinate</code>](#Coordinate) | Current position of the player |
| penalty | <code>number</code> | Turns left from penalty |

